import { localizePath, type Locale } from '@/lib/i18n/config';
import { filtersToSearchParams, formatDateParam, getApiCategoryFilter } from './filter-utils';
import type { EventsFiltersState } from './types';

export const CATEGORY_PATH = '/category';

/**
 * One category is a page; two are a filter.
 *
 * A single category is the facet people search for, so it gets a path of its own that can be
 * indexed and linked. Every other filter, and any further category, stays in the query string:
 * those combinations are endless and belong to one catalogue page rather than to pages of their
 * own.
 */
export function buildCatalogueHref(
	locale: Locale,
	filters: EventsFiltersState,
	currentParams: URLSearchParams,
): string {
	const params = filtersToSearchParams(currentParams, filters);
	const singleCategory = filters.categories.length === 1 ? filters.categories[0] : null;

	if (singleCategory) {
		params.delete('categories');
	}

	const query = params.toString();
	const path = singleCategory ? `${CATEGORY_PATH}/${encodeURIComponent(singleCategory)}` : '';

	return localizePath(`${path || '/'}${query ? `?${query}` : ''}`, locale);
}

/** The events request behind a catalogue page, server side and client side alike. */
export function buildEventsApiUrl(
	filters: EventsFiltersState,
	searchQuery = '',
	limit?: number,
): string {
	const params = new URLSearchParams();

	if (limit) params.set('limit', String(limit));

	if (searchQuery) params.set('search', searchQuery);

	if (filters.dateRange) {
		params.set('startDate', formatDateParam(filters.dateRange.from));
		params.set('endDate', formatDateParam(filters.dateRange.to));
	}

	if (filters.categories.length > 0) {
		params.set('categories', filters.categories.join(','));
	}

	if (filters.priceRange) {
		params.set('minPrice', String(filters.priceRange.min));
		params.set('maxPrice', String(filters.priceRange.max));
	}

	if (filters.guests !== null && filters.guests > 0) {
		params.set('guests', String(filters.guests));
	}

	if (filters.difficulties.length > 0) {
		params.set('difficulty', filters.difficulties.join(','));
	}

	const apiCategory = getApiCategoryFilter(filters.categories);
	if (apiCategory) params.set('category', apiCategory);

	const query = params.toString();

	return `/events${query ? `?${query}` : ''}`;
}
