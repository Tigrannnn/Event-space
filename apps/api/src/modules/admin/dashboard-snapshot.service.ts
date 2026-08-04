import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import type { DashboardSnapshot } from '@event-space/shared';

/**
 * Freezes one row of dashboard state per finished day.
 *
 * Live queries cannot answer "how did things look in March": a booking confirmed in January and
 * refunded in April is no longer CONFIRMED, so recomputing an old period today returns less than
 * that period actually showed. Snapshots stop that drift.
 *
 * Only state is stored. Flow ("how many bookings were created in March") derives from
 * `createdAt`, which never changes, so it stays a live query and is not duplicated here.
 */
@Injectable()
export class DashboardSnapshotService {
	private readonly logger = new Logger(DashboardSnapshotService.name);

	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Runs just after midnight and freezes the day that just ended.
	 *
	 * Today is never snapshotted — it is still changing, and the dashboard shows it live.
	 */
	@Cron(CronExpression.EVERY_DAY_AT_1AM)
	async captureYesterday(): Promise<void> {
		const yesterday = new Date();
		yesterday.setUTCDate(yesterday.getUTCDate() - 1);

		try {
			await this.capture(yesterday);
		} catch (error) {
			this.logger.error('Failed to capture dashboard snapshot', error as Error);
		}
	}

	/**
	 * Writes the snapshot for a given day. Safe to re-run: the day is the primary key, so a
	 * repeat overwrites rather than duplicating.
	 */
	async capture(day: Date): Promise<void> {
		const date = toUtcDay(day);

		const [
			totalEvents,
			totalUsers,
			publishedEvents,
			draftEvents,
			cancelledEvents,
			bookingsByStatus,
			capacity,
			revenue,
		] = await Promise.all([
			this.prisma.event.count(),
			this.prisma.user.count(),
			this.prisma.event.count({ where: { status: 'PUBLISHED' } }),
			this.prisma.event.count({ where: { status: 'DRAFT' } }),
			this.prisma.event.count({ where: { status: 'CANCELLED' } }),
			this.prisma.booking.groupBy({ by: ['status'], _count: { _all: true } }),
			this.prisma.eventOccurrence.aggregate({
				_sum: { currentParticipants: true, maxParticipants: true },
			}),
			this.prisma.booking.aggregate({
				where: { status: 'CONFIRMED' },
				_sum: { amount: true },
			}),
		]);

		const counts = { PENDING: 0, CONFIRMED: 0, CANCELLED: 0, EXPIRED: 0 };
		for (const row of bookingsByStatus) {
			counts[row.status] = row._count._all;
		}
		const totalBookings =
			counts.PENDING + counts.CONFIRMED + counts.CANCELLED + counts.EXPIRED;

		const data = {
			totalEvents,
			totalUsers,
			publishedEvents,
			draftEvents,
			cancelledEvents,
			totalBookings,
			pendingBookings: counts.PENDING,
			confirmedBookings: counts.CONFIRMED,
			cancelledBookings: counts.CANCELLED,
			expiredBookings: counts.EXPIRED,
			totalCapacity: capacity._sum.maxParticipants ?? 0,
			usedCapacity: capacity._sum.currentParticipants ?? 0,
			totalRevenue: revenue._sum.amount ?? new Prisma.Decimal(0),
		};

		await this.prisma.dashboardSnapshot.upsert({
			where: { date },
			create: { date, ...data },
			update: data,
		});

		this.logger.log(`Captured dashboard snapshot for ${date.toISOString().slice(0, 10)}`);
	}

	/**
	 * Snapshots for a date range, oldest first.
	 *
	 * Days with no row are simply absent rather than interpolated — a gap in the chart is honest
	 * about the job not having run, where a drawn line would invent history.
	 */
	async findRange(from: string, to: string): Promise<DashboardSnapshot[]> {
		const rows = await this.prisma.dashboardSnapshot.findMany({
			where: { date: { gte: new Date(`${from}T00:00:00.000Z`), lte: new Date(`${to}T00:00:00.000Z`) } },
			orderBy: { date: 'asc' },
		});

		return rows.map((row) => ({
			date: row.date.toISOString().slice(0, 10),
			totalEvents: row.totalEvents,
			totalUsers: row.totalUsers,
			events: {
				published: row.publishedEvents,
				draft: row.draftEvents,
				cancelled: row.cancelledEvents,
			},
			bookings: {
				total: row.totalBookings,
				pending: row.pendingBookings,
				confirmed: row.confirmedBookings,
				cancelled: row.cancelledBookings,
				expired: row.expiredBookings,
			},
			totalCapacity: row.totalCapacity,
			usedCapacity: row.usedCapacity,
			totalRevenue: Number(row.totalRevenue),
		}));
	}
}

/** Strips the time so a snapshot is keyed by calendar day, not by the moment the job ran. */
function toUtcDay(value: Date): Date {
	return new Date(
		Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
	);
}
