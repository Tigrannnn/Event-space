import type { BookingStatus, BookingStatusCounts, RescheduleAnswers } from '@event-space/shared';
import { PrismaService } from '@infra/prisma/prisma.service';

const emptyStats = (): BookingStatusCounts => ({
	total: 0,
	pending: 0,
	confirmed: 0,
	cancelled: 0,
	checkedIn: 0,
});

const STATUS_TO_KEY: Record<BookingStatus, keyof BookingStatusCounts> = {
	PENDING: 'pending',
	CONFIRMED: 'confirmed',
	CANCELLED: 'cancelled',
};

const addStats = (target: BookingStatusCounts, source: BookingStatusCounts): void => {
	target.total += source.total;
	target.pending += source.pending;
	target.confirmed += source.confirmed;
	target.cancelled += source.cancelled;
	target.checkedIn = (target.checkedIn ?? 0) + (source.checkedIn ?? 0);
};

/**
 * Adds a per-status booking breakdown to every occurrence, and the event-wide total.
 *
 * One grouped query covers the whole page rather than one per event. Prisma cannot
 * express this through `_count`, which allows only a single filter per relation — the
 * reason the old code could report just one status and left the rest invisible.
 */
export async function attachBookingStats<T extends { id: string; occurrences: { id: string }[] }>(
	prisma: PrismaService,
	events: T[],
): Promise<(T & { bookingStats: BookingStatusCounts })[]> {
	if (events.length === 0) return [];

	const eventIds = events.map((event) => event.id);
	const [grouped, checkedIn, accepted, awaiting] = await Promise.all([
		prisma.booking.groupBy({
			by: ['occurrenceId', 'status'],
			where: { occurrence: { eventId: { in: eventIds } } },
			_count: { _all: true },
		}),
		prisma.booking.groupBy({
			by: ['occurrenceId'],
			where: {
				occurrence: { eventId: { in: eventIds } },
				status: 'CONFIRMED',
				checkedInAt: { not: null },
			},
			_count: { _all: true },
		}),
		prisma.booking.groupBy({
			by: ['occurrenceId'],
			where: {
				occurrence: { eventId: { in: eventIds } },
				status: { not: 'CANCELLED' },
				rescheduleAcceptedAt: { not: null },
			},
			_count: { _all: true },
		}),
		prisma.booking.groupBy({
			by: ['occurrenceId'],
			where: {
				occurrence: { eventId: { in: eventIds } },
				status: { not: 'CANCELLED' },
				rescheduleAcceptedAt: null,
				rescheduleRefundUntil: { not: null },
			},
			_count: { _all: true },
		}),
	]);

	const answersByOccurrence = new Map<string, RescheduleAnswers>();
	const answersFor = (occurrenceId: string): RescheduleAnswers => {
		let answers = answersByOccurrence.get(occurrenceId);
		if (!answers) {
			answers = { asked: 0, accepted: 0 };
			answersByOccurrence.set(occurrenceId, answers);
		}
		return answers;
	};

	for (const row of accepted) {
		const answers = answersFor(row.occurrenceId);
		answers.accepted += row._count._all;
		answers.asked += row._count._all;
	}

	for (const row of awaiting) {
		answersFor(row.occurrenceId).asked += row._count._all;
	}

	const statsByOccurrence = new Map<string, BookingStatusCounts>();
	for (const row of grouped) {
		let stats = statsByOccurrence.get(row.occurrenceId);
		if (!stats) {
			stats = emptyStats();
			statsByOccurrence.set(row.occurrenceId, stats);
		}

		const count = row._count._all;
		stats[STATUS_TO_KEY[row.status]] += count;
		stats.total += count;
	}

	for (const row of checkedIn) {
		const stats = statsByOccurrence.get(row.occurrenceId);
		if (stats) stats.checkedIn = row._count._all;
	}

	return events.map((event) => {
		const eventStats = emptyStats();

		const occurrences = event.occurrences.map((occurrence) => {
			const stats = statsByOccurrence.get(occurrence.id) ?? emptyStats();
			addStats(eventStats, stats);
			const answers = answersByOccurrence.get(occurrence.id);
			return {
				...occurrence,
				bookingStats: stats,
				...(answers ? { rescheduleAnswers: answers } : {}),
			};
		});

		return { ...event, occurrences, bookingStats: eventStats };
	});
}
