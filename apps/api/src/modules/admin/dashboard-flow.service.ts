import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import type { DashboardFlow, DashboardFlowPoint } from '@event-space/shared';
import { endOfDay, startOfDay, toDateKey } from './dashboard-dates';

interface FlowTotals {
	bookingsCreated: number;
	revenue: number;
}

/**
 * "What happened over a period", as opposed to "how things stood".
 *
 * Both figures are stable under recomputation, which is the whole point of a flow chart: asking
 * for March next year must return what March returned in March.
 *
 * `bookingsCreated` is stable because a booking's `createdAt` never changes.
 *
 * `revenue` is read from BookingAdjustment, the ledger of money that actually moved: a CHARGE row
 * when Stripe captured the payment, a REFUND row when it gave it back, each carrying its own date.
 * A refund in May therefore lands in May and leaves March alone. Summing `amount` over bookings
 * that are CONFIRMED *now* — what this did before — moved the refund back into March and quietly
 * rewrote a closed month.
 *
 * Only SUCCEEDED rows count: a refund that failed at Stripe, or one an admin marked for manual
 * handling, is written as FAILED or PENDING with an amount of 0 and moved no money.
 *
 * Cash is in the ledger too — `recordOfflinePayment` writes a CHARGE row when an admin enters a
 * booking as OFFLINE_PAID, so this service does not have to know how the money arrived.
 *
 * PAY_ON_ARRIVAL bookings are absent from the ledger and therefore from this figure, which is
 * correct: that money has been promised, not collected. Counting it is what the old
 * CONFIRMED-status sum did. If it ever gets collected at the door, the collection is what should
 * write a row.
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
			this.loadWindow(start, end),
			this.loadWindow(previousStart, previousEnd),
		]);

		return {
			points: toDailyPoints(current, start, end),
			totals: toTotals(current),
			previousTotals: toTotals(previous),
		};
	}

	private async loadWindow(from: Date, to: Date): Promise<FlowWindow> {
		const createdAt = { gte: from, lte: to };

		const [bookings, adjustments] = await Promise.all([
			this.prisma.booking.findMany({
				where: { createdAt },
				select: { createdAt: true },
			}),
			this.prisma.bookingAdjustment.findMany({
				where: { status: 'SUCCEEDED', createdAt },
				select: { createdAt: true, type: true, amount: true },
			}),
		]);

		return { bookings, adjustments };
	}
}

interface FlowWindow {
	bookings: { createdAt: Date }[];
	adjustments: { createdAt: Date; type: string; amount: unknown }[];
}

/** One movement of money, signed: a charge adds, a refund takes back. */
interface MoneyMovement {
	at: Date;
	amount: number;
}

function toMoneyMovements(window: FlowWindow): MoneyMovement[] {
	return window.adjustments.map((row) => ({
		at: row.createdAt,
		amount: row.type === 'REFUND' ? -Number(row.amount) : Number(row.amount),
	}));
}

/**
 * Buckets a window into calendar days, including days with nothing.
 *
 * Empty days are emitted as zeroes rather than skipped: a chart that silently omits them would
 * draw a straight line across a quiet week and imply steady activity.
 */
function toDailyPoints(window: FlowWindow, start: Date, end: Date): DashboardFlowPoint[] {
	const buckets = new Map<string, DashboardFlowPoint>();

	for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
		const key = toDateKey(day);
		buckets.set(key, { date: key, bookingsCreated: 0, revenue: 0 });
	}

	for (const booking of window.bookings) {
		const point = buckets.get(toDateKey(booking.createdAt));
		if (point) point.bookingsCreated += 1;
	}

	for (const movement of toMoneyMovements(window)) {
		const point = buckets.get(toDateKey(movement.at));
		if (point) point.revenue += movement.amount;
	}

	return [...buckets.values()];
}

function toTotals(window: FlowWindow): FlowTotals {
	const revenue = toMoneyMovements(window).reduce((sum, movement) => sum + movement.amount, 0);

	return {
		bookingsCreated: window.bookings.length,
		revenue,
	};
}
