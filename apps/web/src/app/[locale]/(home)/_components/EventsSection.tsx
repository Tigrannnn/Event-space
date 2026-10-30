import { PaginatedEventsResponse } from '@/features/events/api/events.api';
import EventsList from './EventsList';

interface EventsSectionProps {
	/** Started by the page before it waits for the banners, so the two requests run side by side. */
	events: Promise<PaginatedEventsResponse>;
	searchQuery: string;
}

/**
 * Fetches the catalogue on its own, so the page can show what is already at hand (the banner)
 * while the events are on their way, instead of holding everything for the slowest request.
 */
export default async function EventsSection({ events, searchQuery }: EventsSectionProps) {
	const initialData = await events;

	return (
		<EventsList
			initialEvents={initialData.data}
			initialNextCursor={initialData.nextCursor}
			initialHasMore={initialData.hasMore}
			searchQuery={searchQuery}
		/>
	);
}
