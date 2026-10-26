import { readNumber, readString, writeParam } from '@/hooks/urlFilters';

export const DEFAULT_PAGE_SIZE = 20;

export interface AdminPromoCodesFilters {
	skip: number;
	limit: number;
	search?: string;
}

export function emptyPromoCodesFilters(): AdminPromoCodesFilters {
	return { skip: 0, limit: DEFAULT_PAGE_SIZE };
}

export function parsePromoCodesFilters(params: URLSearchParams): AdminPromoCodesFilters {
	return {
		skip: readNumber(params, 'skip') ?? 0,
		limit: readNumber(params, 'limit') ?? DEFAULT_PAGE_SIZE,
		search: readString(params, 'search'),
	};
}

export function serializePromoCodesFilters(
	params: URLSearchParams,
	filters: AdminPromoCodesFilters,
): URLSearchParams {
	writeParam(params, 'skip', filters.skip > 0 ? filters.skip : undefined);
	writeParam(params, 'limit', filters.limit === DEFAULT_PAGE_SIZE ? undefined : filters.limit);
	writeParam(params, 'search', filters.search);
	return params;
}

export function countActivePromoCodesFilters(filters: AdminPromoCodesFilters): number {
	return filters.search ? 1 : 0;
}
