import EventsList from './_components/EventsList';
import { serverFetch } from '@/lib/server.api';
import { PaginatedEventsResponse } from '@/features/events/api/events.api';

interface HomePageProps {
	searchParams: Promise<{ search?: string; startDate?: string; endDate?: string }>;
}

export default async function Home({ searchParams }: HomePageProps) {
	const params = await searchParams;
	const searchQuery = params.search || '';
	const startDate = params.startDate;
	const endDate = params.endDate;

	// Build URL with all filters
	const urlParams = new URLSearchParams();
	if (searchQuery) urlParams.set('search', searchQuery);
	if (startDate) urlParams.set('startDate', startDate);
	if (endDate) urlParams.set('endDate', endDate);
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
			/>
		</div>
	);
}
