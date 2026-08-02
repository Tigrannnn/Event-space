import { readNumber, readString, writeParam } from '@/hooks/urlFilters';

export const DEFAULT_PAGE_SIZE = 20;

export interface AdminCategoriesFilters {
	skip: number;
	limit: number;
	search?: string;
}

export function emptyCategoriesFilters(): AdminCategoriesFilters {
	return { skip: 0, limit: DEFAULT_PAGE_SIZE };
}

export function parseCategoriesFilters(params: URLSearchParams): AdminCategoriesFilters {
	return {
		skip: readNumber(params, 'skip') ?? 0,
		limit: readNumber(params, 'limit') ?? DEFAULT_PAGE_SIZE,
		search: readString(params, 'search'),
	};
}

export function serializeCategoriesFilters(
	params: URLSearchParams,
	filters: AdminCategoriesFilters,
): URLSearchParams {
	writeParam(params, 'skip', filters.skip > 0 ? filters.skip : undefined);
	writeParam(params, 'limit', filters.limit === DEFAULT_PAGE_SIZE ? undefined : filters.limit);
	writeParam(params, 'search', filters.search);
	return params;
}

export function countActiveCategoriesFilters(filters: AdminCategoriesFilters): number {
	return filters.search ? 1 : 0;
}
