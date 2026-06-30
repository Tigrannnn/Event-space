import EventsList from './_components/EventsList';
import { serverFetch } from '@/lib/server.api';
import { PaginatedEventsResponse } from '@/features/events/api/events.api';

interface HomePageProps {
	searchParams: Promise<{
		search?: string;
		startDate?: string;
		endDate?: string;
		category?: string;
		minPrice?: string;
		maxPrice?: string;
	}>;
}

function parsePriceParam(value?: string): number | undefined {
	if (!value) return undefined;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

export default async function Home({ searchParams }: HomePageProps) {
	const params = await searchParams;
	const searchQuery = params.search || '';
	const startDate = params.startDate;
	const endDate = params.endDate;
	const category = params.category;
	const minPrice = parsePriceParam(params.minPrice);
	const maxPrice = parsePriceParam(params.maxPrice);

	// Build URL with all filters
	const urlParams = new URLSearchParams();
	if (searchQuery) urlParams.set('search', searchQuery);
	if (startDate) urlParams.set('startDate', startDate);
	if (endDate) urlParams.set('endDate', endDate);
	if (category) urlParams.set('category', category);
	if (minPrice !== undefined) urlParams.set('minPrice', String(minPrice));
	if (maxPrice !== undefined) urlParams.set('maxPrice', String(maxPrice));
	const url = `/events${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;

	// SSR: Initial load with search, date filters and pagination
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
				startDate={startDate}
				endDate={endDate}
				category={category}
				minPrice={minPrice}
				maxPrice={maxPrice}
			/>
		</div>
	);
}
