import clientApi from '@/lib/client.api';
import { Event } from '@event-space/shared';

export interface PaginatedEventsResponse {
	data: Event[];
	nextCursor: string | null;
	hasMore: boolean;
}

export interface GetEventsParams {
	cursor?: string;
	limit?: number;
	search?: string;
}

export const eventApi = {
	getEvents: ({ cursor, limit = 8, search }: GetEventsParams = {}) =>
		clientApi
			.get<PaginatedEventsResponse>('/events', {
				params: { cursor, limit, search },
			})
			.then((res) => res.data),

	getEventById: (id: string) => clientApi.get<Event>(`/events/${id}`).then((res) => res.data),
};
