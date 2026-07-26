import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/server.api';
import { Event, PaginatedResponse } from '@event-space/shared';
import EventsTable from '../_components/EventsTable';

interface EventPageProps {
	params: { locale: string; id: string };
}

export default async function EventPage({ params }: EventPageProps) {
	const { id } = params;

	try {
		const event = await serverFetch<Event>(`/admin/events/${id}`);
		const initialEvents: PaginatedResponse<Event> = {
			data: [event],
			total: 1,
			skip: 0,
			take: 1,
			hasMore: false,
			nextSkip: null,
		};

		return (
			<div className="space-y-6">
				<EventsTable initialEvents={initialEvents} disableFetch />
			</div>
		);
	} catch (error) {
		console.error(error);
		notFound();
	}
}
