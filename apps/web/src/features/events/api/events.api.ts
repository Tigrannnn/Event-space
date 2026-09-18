import clientApi from '@/lib/client.api';
import {
	Event,
	EventDifficulty,
	PaginatedCursorParams,
	PaginatedCursorResponse,
} from '@event-space/shared';

export interface GetEventsParams extends PaginatedCursorParams {
	search?: string;
	startDate?: string;
	endDate?: string;
	category?: string;
	minPrice?: number;
	maxPrice?: number;
	guests?: number;
	difficulties?: EventDifficulty[];
}

export type PaginatedEventsResponse = PaginatedCursorResponse<Event>;

export const eventApi = {
	getEvents: (
		{
			cursor,
			limit = 8,
			search,
			startDate,
			endDate,
			category,
			minPrice,
			maxPrice,
			guests,
			difficulties,
		}: GetEventsParams = {},
		signal?: AbortSignal,
	) =>
		clientApi
			.get<PaginatedEventsResponse>('/events', {
				params: {
					cursor,
					limit,
					search,
					startDate,
					endDate,
					category,
					minPrice,
					maxPrice,
					guests,
					// Sent as one comma-separated value, the way the API reads it.
					difficulty: difficulties?.length ? difficulties.join(',') : undefined,
				},
				signal,
			})
			.then((res) => res.data),

	getEventById: (id: string) => clientApi.get<Event>(`/events/${id}`).then((res) => res.data),
};
