import { EventDifficultyEnum, EventStatusEnum, TimeFilterSchema } from '@event-space/shared';
import type { EventDifficulty, EventStatus, TimeFilterType } from '@event-space/shared';
import { readEnum, readNumber, readString, writeParam } from '@/hooks/urlFilters';

export const DEFAULT_PAGE_SIZE = 20;

export interface AdminEventsFilters {
	skip: number;
	limit: number;
	search?: string;
	status?: EventStatus;
	difficulty?: EventDifficulty;
	time?: TimeFilterType;
	category?: string;
	minPrice?: number;
	maxPrice?: number;
}

export function emptyEventsFilters(): AdminEventsFilters {
	return { skip: 0, limit: DEFAULT_PAGE_SIZE };
}

export function parseEventsFilters(params: URLSearchParams): AdminEventsFilters {
	return {
		skip: readNumber(params, 'skip') ?? 0,
		limit: readNumber(params, 'limit') ?? DEFAULT_PAGE_SIZE,
		search: readString(params, 'search'),
		status: readEnum(params, 'status', EventStatusEnum.options),
		difficulty: readEnum(params, 'difficulty', EventDifficultyEnum.options),
		time: readEnum(params, 'time', TimeFilterSchema.options),
		category: readString(params, 'category'),
		minPrice: readNumber(params, 'minPrice'),
		maxPrice: readNumber(params, 'maxPrice'),
	};
}

export function serializeEventsFilters(
	params: URLSearchParams,
	filters: AdminEventsFilters,
): URLSearchParams {
	// `skip` and the default page size are omitted so the common case keeps a clean URL.
	writeParam(params, 'skip', filters.skip > 0 ? filters.skip : undefined);
	writeParam(params, 'limit', filters.limit === DEFAULT_PAGE_SIZE ? undefined : filters.limit);
	writeParam(params, 'search', filters.search);
	writeParam(params, 'status', filters.status);
	writeParam(params, 'difficulty', filters.difficulty);
	writeParam(params, 'time', filters.time);
	writeParam(params, 'category', filters.category);
	writeParam(params, 'minPrice', filters.minPrice);
	writeParam(params, 'maxPrice', filters.maxPrice);
	return params;
}

/** Pagination and page size are not filters — they don't count towards the "active" badge. */
export function countActiveEventsFilters(filters: AdminEventsFilters): number {
	return [
		filters.search,
		filters.status,
		filters.difficulty,
		filters.time,
		filters.category,
		filters.minPrice,
		filters.maxPrice,
	].filter((value) => value !== undefined).length;
}
