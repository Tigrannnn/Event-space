import { Injectable } from '@nestjs/common';
import type { BookingStatus } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import type { BookingCohort, BookingStatePoint, BookingStatusCounts } from '@event-space/shared';
import { endOfDay, startOfDay, toDateKey } from './dashboard-dates';

type StatusTally = Record<BookingStatus, number>;

/**
 * Reads `booking_status_history`, the interval table a Postgres trigger keeps in step with
 * `bookings.status` (see the add_booking_status_history migration).
 *
 * Every row covers one period a booking spent in one status, so a question about the past is a
 * range lookup instead of a guess: `valid_from <= X AND (valid_to > X OR valid_to IS NULL)` is the
 * state as of X, however many times the booking has changed since.
 */
@Injectable()
export class BookingStatusHistoryService {
	constructor(private readonly prisma: PrismaService) {}

	/** How many bookings held each status at a given instant. */
	async countsAt(at: Date): Promise<BookingStatusCounts> {
		return toCounts(await this.tallyAt(at));
	}

	/**
	 * State at the end of every day of a period, oldest first.
	 *
	 * Built as one opening position plus the transitions that follow it, not as one lookup per day.
	 * A "how did it stand" query has to weigh every booking alive at that moment, including ones
	 * untouched for years, so a per-day loop walks the whole table once per day; transitions inside
	 * a window are few, and a booking that never changed contributes none.
	 */
	async dailyCounts(from: string, to: string): Promise<BookingStatePoint[]> {
		const start = startOfDay(from);
		const end = endOfDay(to);

		const [tally, entered, left] = await Promise.all([
			this.tallyAt(start),
			this.prisma.bookingStatusHistory.findMany({
				where: { validFrom: { gt: start, lte: end } },
				select: { status: true, validFrom: true },
			}),
			this.prisma.bookingStatusHistory.findMany({
				where: { validTo: { gt: start, lte: end } },
				select: { status: true, validTo: true },
			}),
		]);

		// A booking entering a status and leaving the previous one are two separate rows, so both
		// halves of a transition have to be collected; the first period of a booking is an entry
		// with no matching exit, which is exactly how a new booking should read.
		const changes = [
			...entered.map((row) => ({ at: row.validFrom, status: row.status, delta: 1 })),
			...left.map((row) => ({ at: row.validTo as Date, status: row.status, delta: -1 })),
		].sort((first, second) => first.at.getTime() - second.at.getTime());

		const points: BookingStatePoint[] = [];
		let applied = 0;

		for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
			const date = toDateKey(day);
			const closing = endOfDay(date);

			while (applied < changes.length && changes[applied].at <= closing) {
				tally[changes[applied].status] += changes[applied].delta;
				applied += 1;
			}

			points.push({ date, bookings: toCounts(tally) });
		}

		return points;
	}

	/**
	 * The cohort of bookings created in a period.
	 *
	 * Anchored to `createdAt`, so the cohort itself never changes membership — only what happened
	 * to it does.
	 */
	async cohort(from: string, to: string): Promise<BookingCohort> {
		const createdAt = { gte: startOfDay(from), lte: endOfDay(to) };

		const [byStatus, confirmedOnce, attended] = await Promise.all([
			this.prisma.booking.groupBy({
				by: ['status'],
				where: { createdAt },
				_count: { _all: true },
			}),
			// distinct because a booking may have been confirmed more than once — cancelled and
			// re-entered by an admin — and it is still one conversion.
			this.prisma.bookingStatusHistory.findMany({
				where: { status: 'CONFIRMED', booking: { createdAt } },
				distinct: ['bookingId'],
				select: { bookingId: true },
			}),
			this.prisma.booking.count({ where: { createdAt, checkedInAt: { not: null } } }),
		]);

		const tally = emptyTally();
		for (const row of byStatus) {
			tally[row.status] = row._count._all;
		}

		const current = toCounts(tally);

		return {
			created: current.total,
			everConfirmed: confirmedOnce.length,
			attended,
			current,
		};
	}

	private async tallyAt(at: Date): Promise<StatusTally> {
		const rows = await this.prisma.bookingStatusHistory.groupBy({
			by: ['status'],
			where: {
				validFrom: { lte: at },
				// The open period has no end date; a closed one covers `at` only if it outlasts it.
				OR: [{ validTo: { gt: at } }, { validTo: null }],
			},
			_count: { _all: true },
		});

		const tally = emptyTally();
		for (const row of rows) {
			tally[row.status] = row._count._all;
		}

		return tally;
	}
}

function emptyTally(): StatusTally {
	return { PENDING: 0, CONFIRMED: 0, CANCELLED: 0, EXPIRED: 0 };
}

function toCounts(tally: StatusTally): BookingStatusCounts {
	return {
		total: tally.PENDING + tally.CONFIRMED + tally.CANCELLED + tally.EXPIRED,
		pending: tally.PENDING,
		confirmed: tally.CONFIRMED,
		cancelled: tally.CANCELLED,
		expired: tally.EXPIRED,
	};
}
