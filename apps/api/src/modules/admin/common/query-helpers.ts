import { endOfDay, startOfDay } from '../../../shared/utils/app-day.util';

/**
 * Turns a `YYYY-MM-DD` range into a Prisma filter covering whole Yerevan days, so the end date
 * includes everything that happened on it rather than cutting off at midnight.
 */
export function buildDayRangeFilter(
	from?: string,
	to?: string,
): { gte?: Date; lte?: Date } | undefined {
	if (!from && !to) return undefined;

	return {
		...(from ? { gte: startOfDay(from) } : {}),
		...(to ? { lte: endOfDay(to) } : {}),
	};
}

export interface Page<T> {
	data: T[];
	total: number;
	skip: number;
	take: number;
	hasMore: boolean;
	nextSkip: number | null;
}

/**
 * Lists are fetched with one row more than asked for; that extra row is how "is there a next
 * page" is known without a second count.
 */
export function toPage<T>(rows: T[], total: number, skip: number, limit: number): Page<T> {
	const hasMore = rows.length > limit;

	return {
		data: hasMore ? rows.slice(0, limit) : rows,
		total,
		skip,
		take: limit,
		hasMore,
		nextSkip: hasMore ? skip + limit : null,
	};
}
