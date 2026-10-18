import type { Prisma } from '@prisma/client';
import { isUuid } from '@event-space/shared';
import type {
	EventDifficulty,
	EventStatus,
	SpotsFilterType,
	TimeFilterType,
} from '@event-space/shared';
import { buildOccurrenceDateFilter } from '@modules/event/event.utils';

export interface EventFilters {
	search?: string;
	status?: EventStatus;
	difficulty?: EventDifficulty;
	time?: TimeFilterType;
	minPrice?: number;
	maxPrice?: number;
	category?: string;
	/** `YYYY-MM-DD`, inclusive on both ends. */
	startDate?: string;
	endDate?: string;
	spots?: SpotsFilterType;
}

/**
 * @param hasFreeSpot Prisma's reference to the `maxParticipants` column, so occupancy compares one
 * column against another inside the query instead of in JS after the page was cut.
 */
export function buildEventsWhere(
	filters: EventFilters,
	now: Date,
	hasFreeSpot: { lt: Prisma.IntFieldRefInput<'EventOccurrence'> },
): Prisma.EventWhereInput {
	const { search, status, difficulty, time, minPrice, maxPrice, category } = filters;
	const { startDate, endDate, spots } = filters;

	// `time` and the date range both constrain the same `occurrences` relation, so they are
	// merged into a single condition. Spread separately they would collide on the `occurrences`
	// key and the later one would silently drop the earlier filter — the same trap the price
	// bounds below are written around.
	const occurrenceDate: Prisma.DateTimeFilter = buildOccurrenceDateFilter(startDate, endDate) ?? {};

	if (time === 'upcoming') {
		// Whichever lower bound is stricter wins: an admin asking for August of next year and
		// "upcoming" wants August, not everything from today onwards.
		const rangeStart = occurrenceDate.gte as Date | undefined;
		occurrenceDate.gte = rangeStart && rangeStart > now ? rangeStart : now;
	}

	// An event is completed only once nothing is left to run: it has a past date and no future
	// one. The "no future date" half is an exclusion over all of its dates, added to `where`
	// below; here the event only has to have happened at least once.
	if (time === 'completed') {
		occurrenceDate.lt = now;
	}

	// A cancelled date will not take place, so it neither makes an event upcoming nor keeps it
	// from being completed.
	const upcomingDate: Prisma.EventOccurrenceWhereInput = { date: { gte: now }, status: 'ACTIVE' };

	const hasOccurrenceFilter = Object.keys(occurrenceDate).length > 0;

	// Every occurrence-level condition goes into the same `some`, so they all have to hold for
	// one and the same date. Split across two `some` clauses, "has a date in August" and "has a
	// date with room" would both pass for an event whose August date is sold out and whose
	// October date is empty.
	const occurrenceMatch: Prisma.EventOccurrenceWhereInput = {
		...(hasOccurrenceFilter ? { date: occurrenceDate } : {}),
		...(spots || time === 'upcoming' ? { status: 'ACTIVE' as const } : {}),
		...(spots === 'available' ? { currentParticipants: hasFreeSpot } : {}),
		...(spots === 'empty' ? { currentParticipants: 0 } : {}),
	};

	const hasOccurrenceMatch = Object.keys(occurrenceMatch).length > 0;

	// Conditions an event must not meet. Kept in one NOT list because both would otherwise be
	// spread onto the same `NOT` key and the later would drop the earlier.
	const exclusions: Prisma.EventWhereInput[] = [
		...(time === 'completed' ? [{ occurrences: { some: upcomingDate } }] : []),
		// "Sold out" is the absence of a sellable date among the ones already matched above,
		// so it rides on the same conditions rather than introducing its own.
		...(spots === 'full'
			? [{ occurrences: { some: { ...occurrenceMatch, currentParticipants: hasFreeSpot } } }]
			: []),
	];

	// Both bounds constrain `price`, so they are built as one condition — as separate spreads
	// the upper bound would overwrite the lower and quietly widen the result.
	const price = {
		...(minPrice !== undefined ? { gte: minPrice } : {}),
		...(maxPrice !== undefined ? { lte: maxPrice } : {}),
	};

	return {
		...(search
			? {
					OR: [
						...(isUuid(search) ? [{ id: search }] : []),
						{
							translations: {
								some: {
									OR: [
										{ title: { contains: search, mode: 'insensitive' as const } },
										{ description: { contains: search, mode: 'insensitive' as const } },
										{ location: { contains: search, mode: 'insensitive' as const } },
									],
								},
							},
						},
					],
				}
			: {}),
		...(status ? { status } : {}),
		...(difficulty ? { difficulty } : {}),
		...(hasOccurrenceMatch ? { occurrences: { some: occurrenceMatch } } : {}),
		...(exclusions.length > 0 ? { NOT: exclusions } : {}),
		...(category ? { category: { slug: category } } : {}),
		...(Object.keys(price).length > 0 ? { price } : {}),
	};
}
