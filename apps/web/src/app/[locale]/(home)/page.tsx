import EventsList from './_components/EventsList';
import { serverFetch } from '@/lib/server.api';
import { PaginatedEventsResponse } from '@/features/events/api/events.api';
import { formatDateParam, getApiCategoryFilter, parseFiltersFromSearchParams } from './_components/filters/filter-utils';

interface HomePageProps {
	searchParams: Promise<{
		search?: string;
		startDate?: string;
		endDate?: string;
		category?: string;
		categories?: string;
		minPrice?: string;
		maxPrice?: string;
		guests?: string;
	}>;
}

export default async function Home({ searchParams }: HomePageProps) {
	const params = await searchParams;
	const searchQuery = params.search || '';

	const urlSearchParams = new URLSearchParams();
	Object.entries(params).forEach(([key, value]) => {
		if (value) urlSearchParams.set(key, value);
	});

	const filters = parseFiltersFromSearchParams(urlSearchParams);

	const urlParams = new URLSearchParams();
	if (searchQuery) urlParams.set('search', searchQuery);
	if (filters.dateRange) {
		urlParams.set('startDate', formatDateParam(filters.dateRange.from));
		urlParams.set('endDate', formatDateParam(filters.dateRange.to));
	}
	if (filters.categories.length > 0) {
		urlParams.set('categories', filters.categories.join(','));
	}
	if (filters.priceRange) {
		urlParams.set('minPrice', String(filters.priceRange.min));
		urlParams.set('maxPrice', String(filters.priceRange.max));
	}
	if (filters.guests !== null && filters.guests > 0) {
		urlParams.set('guests', String(filters.guests));
	}

	const apiCategory = getApiCategoryFilter(filters.categories);
	if (apiCategory) urlParams.set('category', apiCategory);

	const url = `/events${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;

	const initialData = await serverFetch<PaginatedEventsResponse>(url).catch((error) => {
		console.error('Error fetching events:', error);
		return { data: [], nextCursor: null, hasMore: false };
	});

	return (
		<div className="min-h-full px-4 sm:px-6 lg:px-8">
			<EventsList
				initialEvents={initialData.data}
				initialNextCursor={initialData.nextCursor}
				initialHasMore={initialData.hasMore}
				searchQuery={searchQuery}
			/>
		</div>
	);
}
