import EventsList from './_components/EventsList';
import { eventApi } from '@/features/events';

interface HomePageProps {
	searchParams: Promise<{ search?: string }>;
}

export default async function Home({ searchParams }: HomePageProps) {
	const params = await searchParams;
	const searchQuery = params.search || '';

	// SSR: Initial load with search and pagination
	const initialData = await eventApi.getEvents({
		limit: 8,
		search: searchQuery || undefined,
	});

	return (
		<div className="min-h-[85vh] px-4 sm:px-6 lg:px-8">
			<EventsList
				initialEvents={initialData.data}
				initialNextCursor={initialData.nextCursor}
				initialHasMore={initialData.hasMore}
				searchQuery={searchQuery}
			/>
		</div>
	);
}
