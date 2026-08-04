import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import type { DashboardFlow, DashboardFlowPoint } from '@event-space/shared';

interface FlowTotals {
	bookingsCreated: number;
	revenue: number;
}

/**
 * "What happened over a period", as opposed to "how things stood".
 *
 * `bookingsCreated` is stable under recomputation: when a booking was created never changes.
 *
 * `revenue` is not, and this is a known gap. It sums bookings whose status is CONFIRMED *now*,
 * so a booking paid in March and refunded in May drops out of March's revenue the moment it is
 * refunded — a closed month quietly changes. Computing it from BookingAdjustment instead (CHARGE
 * and REFUND rows carry their own dates and are never rewritten) would put the refund in May
 * where it belongs and leave March alone.
 */
@Injectable()
export class DashboardFlowService {
	constructor(private readonly prisma: PrismaService) {}

	async getFlow(from: string, to: string): Promise<DashboardFlow> {
		const start = startOfDay(from);
		const end = endOfDay(to);

		// The preceding window of the same length, so "+12%" compares like with like.
		const spanMs = end.getTime() - start.getTime();
		const previousEnd = new Date(start.getTime() - 1);
		const previousStart = new Date(previousEnd.getTime() - spanMs);

		const [current, previous] = await Promise.all([
			this.loadBookings(start, end),
			this.loadBookings(previousStart, previousEnd),
		]);

		return {
			points: toDailyPoints(current, start, end),
			totals: toTotals(current),
			previousTotals: toTotals(previous),
		};
	}

	private loadBookings(from: Date, to: Date) {
		return this.prisma.booking.findMany({
			where: { createdAt: { gte: from, lte: to } },
			select: { createdAt: true, amount: true, status: true },
		});
	}
}

type BookingRow = { createdAt: Date; amount: unknown; status: string };

/**
 * Buckets bookings into calendar days, including days with nothing.
 *
 * Empty days are emitted as zeroes rather than skipped: a chart that silently omits them would
 * draw a straight line across a quiet week and imply steady activity.
 */
function toDailyPoints(rows: BookingRow[], start: Date, end: Date): DashboardFlowPoint[] {
	const buckets = new Map<string, DashboardFlowPoint>();

	for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
		const key = toDateKey(day);
		buckets.set(key, { date: key, bookingsCreated: 0, revenue: 0 });
	}

	for (const row of rows) {
		const point = buckets.get(toDateKey(row.createdAt));
		if (!point) continue;

		point.bookingsCreated += 1;
		// Only confirmed money counts as revenue; pending may never arrive.
		if (row.status === 'CONFIRMED') {
			point.revenue += Number(row.amount);
		}
	}

	return [...buckets.values()];
}

function toTotals(rows: BookingRow[]): FlowTotals {
	const confirmed = rows.filter((row) => row.status === 'CONFIRMED');
	const revenue = confirmed.reduce((sum, row) => sum + Number(row.amount), 0);

	return {
		bookingsCreated: rows.length,
		revenue,
	};
}

function toDateKey(value: Date): string {
	const year = value.getFullYear();
	const month = String(value.getMonth() + 1).padStart(2, '0');
	const day = String(value.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function startOfDay(date: string): Date {
	return new Date(`${date}T00:00:00.000`);
}

function endOfDay(date: string): Date {
	return new Date(`${date}T23:59:59.999`);
}
