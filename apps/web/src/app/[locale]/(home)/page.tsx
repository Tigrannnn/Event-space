import EventsList from './_components/EventsList';
import { serverFetch } from '@/lib/server.api';
import { PaginatedEventsResponse } from '@/features/events/api/events.api';

interface HomePageProps {
	searchParams: Promise<{ search?: string }>;
}

export default async function Home({ searchParams }: HomePageProps) {
	const params = await searchParams;
	const searchQuery = params.search || '';

	// SSR: Initial load with search and pagination
	const initialData = await serverFetch<PaginatedEventsResponse>(
		searchQuery ? `/events?search=${encodeURIComponent(searchQuery)}` : '/events'
	).catch((error) => {
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
