import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@infra/prisma/prisma.service';
import type { DashboardSnapshot } from '@event-space/shared';

/**
 * Freezes one row of dashboard state per finished day.
 *
 * A snapshot is the last resort, not the default: it can only report days the job actually ran,
 * and it cannot be backfilled. So it holds only the state that leaves no other trail — event
 * statuses and occurrence capacity, both overwritten in place.
 *
 * Two things used to be frozen here and are not any more, because a better record exists:
 * booking counts come from BookingStatusHistory (see BookingStatusHistoryService) and revenue from
 * the BookingAdjustment ledger (see DashboardFlowService). Both answer for any day, including days
 * before either was written, and neither goes missing when the cron does.
 *
 * Flow ("how many bookings were created in March") derives from `createdAt`, which never changes,
 * so it stays a live query and is not duplicated here either.
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

		const [totalEvents, totalUsers, publishedEvents, draftEvents, cancelledEvents, capacity] =
			await Promise.all([
				this.prisma.event.count(),
				this.prisma.user.count(),
				this.prisma.event.count({ where: { status: 'PUBLISHED' } }),
				this.prisma.event.count({ where: { status: 'DRAFT' } }),
				this.prisma.event.count({ where: { status: 'CANCELLED' } }),
				this.prisma.eventOccurrence.aggregate({
					_sum: { currentParticipants: true, maxParticipants: true },
				}),
			]);

		const data = {
			totalEvents,
			totalUsers,
			publishedEvents,
			draftEvents,
			cancelledEvents,
			totalCapacity: capacity._sum.maxParticipants ?? 0,
			usedCapacity: capacity._sum.currentParticipants ?? 0,
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
			totalCapacity: row.totalCapacity,
			usedCapacity: row.usedCapacity,
		}));
	}
}

/** Strips the time so a snapshot is keyed by calendar day, not by the moment the job ran. */
function toUtcDay(value: Date): Date {
	return new Date(
		Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
	);
}
