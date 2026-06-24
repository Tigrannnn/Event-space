import EventsList from './_components/EventsList';
import { serverFetch } from '@/lib/server.api';
import { PaginatedEventsResponse } from '@/features/events/api/events.api';
import { defaultLocale, isLocale, localeIntl } from '@/lib/i18n/config';

interface HomePageProps {
	searchParams: Promise<{ search?: string }>;
	params: Promise<{ locale: string }>;
}

export default async function Home({ searchParams, params }: HomePageProps) {
	const queryParams = await searchParams;
	const routeParams = await params;
	const searchQuery = queryParams.search || '';
	const rawLocale = routeParams.locale;
	const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

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
				initialLocale={localeIntl[locale]}
			/>
		</div>
	);
}
