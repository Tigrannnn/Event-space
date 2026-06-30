import type { DateRangeFilter, EventsFiltersState, PriceBounds, PriceRangeFilter } from './types';

export function createEmptyFilters(): EventsFiltersState {
	return {
		categories: [],
		dateRange: null,
		guests: null,
		priceRange: null,
	};
}

export function parseFiltersFromSearchParams(searchParams: URLSearchParams): EventsFiltersState {
	const categoriesParam = searchParams.get('categories') ?? searchParams.get('category');
	const categories = categoriesParam
		? categoriesParam.split(',').map((slug) => slug.trim()).filter(Boolean)
		: [];

	const startDate = searchParams.get('startDate');
	const endDate = searchParams.get('endDate');
	const dateRange: DateRangeFilter | null =
		startDate && endDate ? { from: new Date(startDate), to: new Date(endDate) } : null;

	const guestsRaw = searchParams.get('guests');
	const parsedGuests = guestsRaw ? Number(guestsRaw) : NaN;
	const guests = Number.isFinite(parsedGuests) && parsedGuests > 0 ? parsedGuests : null;

	const minPriceRaw = searchParams.get('minPrice');
	const maxPriceRaw = searchParams.get('maxPrice');
	const parsedMin = minPriceRaw ? Number(minPriceRaw) : NaN;
	const parsedMax = maxPriceRaw ? Number(maxPriceRaw) : NaN;
	const priceRange: PriceRangeFilter | null =
		Number.isFinite(parsedMin) && Number.isFinite(parsedMax)
			? { min: parsedMin, max: parsedMax }
			: null;

	return { categories, dateRange, guests, priceRange };
}

export function filtersToSearchParams(
	currentParams: URLSearchParams,
	filters: EventsFiltersState,
): URLSearchParams {
	const params = new URLSearchParams(currentParams.toString());

	params.delete('category');
	params.delete('categories');
	params.delete('startDate');
	params.delete('endDate');
	params.delete('minPrice');
	params.delete('maxPrice');
	params.delete('guests');
	params.delete('cursor');

	if (filters.categories.length > 0) {
		params.set('categories', filters.categories.join(','));
	}

	if (filters.dateRange) {
		params.set('startDate', formatDateParam(filters.dateRange.from));
		params.set('endDate', formatDateParam(filters.dateRange.to));
	}

	if (filters.priceRange) {
		params.set('minPrice', String(filters.priceRange.min));
		params.set('maxPrice', String(filters.priceRange.max));
	}

	if (filters.guests !== null && filters.guests > 0) {
		params.set('guests', String(filters.guests));
	}

	return params;
}

export function formatDateParam(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function isPriceFilterApplied(
	priceRange: PriceRangeFilter | null,
	priceBounds: PriceBounds,
): boolean {
	if (!priceRange) return false;
	return priceRange.min > priceBounds.min || priceRange.max < priceBounds.max;
}

export function countActiveFilters(filters: EventsFiltersState, priceBounds: PriceBounds): number {
	let count = 0;
	if (filters.categories.length > 0) count += 1;
	if (filters.dateRange) count += 1;
	if (filters.guests !== null && filters.guests > 0) count += 1;
	if (isPriceFilterApplied(filters.priceRange, priceBounds)) count += 1;
	return count;
}

export function getTopCategories<T extends { slug: string }>(categories: T[], count = 3): T[] {
	return categories.slice(0, count);
}

export function getExtraSelectedCategories(selected: string[], topSlugs: string[]): string[] {
	return selected.filter((slug) => !topSlugs.includes(slug));
}

export function computePriceBounds(prices: number[]): PriceBounds {
	if (!prices.length) {
		return { min: 0, max: 50000 };
	}

	const maxPrice = Math.max(...prices);
	const roundedMax = Math.max(1000, Math.ceil(maxPrice / 1000) * 1000);

	return { min: 0, max: roundedMax };
}

export function getApiCategoryFilter(categories: string[]): string | undefined {
	return categories.length === 1 ? categories[0] : undefined;
}

export function filterEventsByCategories<T extends { category?: { slug: string } | null }>(
	events: T[],
	categories: string[],
): T[] {
	if (categories.length <= 1) return events;
	return events.filter((event) => event.category?.slug && categories.includes(event.category.slug));
}
