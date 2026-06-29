import clientApi from '@/lib/client.api';
import { Event, PaginatedCursorParams, PaginatedCursorResponse } from '@event-space/shared';

export interface GetEventsParams extends PaginatedCursorParams {
	search?: string;
	startDate?: string;
	endDate?: string;
	category?: string;
}

export type PaginatedEventsResponse = PaginatedCursorResponse<Event>;

export const eventApi = {
	getEvents: ({ cursor, limit = 8, search, startDate, endDate, category }: GetEventsParams = {}, signal?: AbortSignal) =>
		clientApi
			.get<PaginatedEventsResponse>('/events', {
				params: { cursor, limit, search, startDate, endDate, category },
				signal,
			})
			.then((res) => res.data),

	getEventById: (id: string) => clientApi.get<Event>(`/events/${id}`).then((res) => res.data),
};
