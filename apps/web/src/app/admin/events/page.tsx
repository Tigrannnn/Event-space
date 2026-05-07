import { serverFetch } from '@/lib/server.api';
import EventsTable from './_components/EventsTable';
import { PaginatedResponse } from '@event-space/shared';
import { Event } from '@event-space/shared';

export default async function EventsPage() {
	const events = await serverFetch<PaginatedResponse<Event>>('/admin/events');

	return (
		<div className="space-y-6">
			<EventsTable initialEvents={events} />
		</div>
	);
}
