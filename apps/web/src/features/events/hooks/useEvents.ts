import { useInfiniteQuery, useQuery, InfiniteData } from '@tanstack/react-query';
import { Event, EventDifficulty } from '@event-space/shared';
import { eventApi, PaginatedEventsResponse } from '../api/events.api';
import { PUBLIC_LIVE_QUERY_OPTIONS } from '@/hooks/liveQuery';

/**
 * Custom hook to fetch events using React Query with infinite scroll
 */
interface UseEventsOptions {
	limit?: number;
	search?: string;
	startDate?: string;
	endDate?: string;
	category?: string;
	minPrice?: number;
	maxPrice?: number;
	guests?: number;
	difficulties?: EventDifficulty[];
	initialData?: InfiniteData<PaginatedEventsResponse>;
}

export const useEvents = (options: UseEventsOptions = {}) => {
	const {
		limit = 8,
		search = '',
		startDate,
		endDate,
		category,
		minPrice,
		maxPrice,
		guests,
		difficulties,
		initialData,
	} = options;

	return useInfiniteQuery({
		queryKey: [
			'events',
			'infinite',
			search,
			limit,
			startDate,
			endDate,
			category,
			minPrice,
			maxPrice,
			guests,
			difficulties,
		],
		queryFn: async ({ pageParam, signal }): Promise<PaginatedEventsResponse> => {
			return eventApi.getEvents(
				{
					cursor: pageParam as string | undefined,
					limit,
					search: search || undefined,
					startDate,
					endDate,
					category,
					minPrice,
					maxPrice,
					guests,
					difficulties,
				},
				signal,
			);
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10, // 10 minutes
		retry: 1,
		initialData,
	});
};

/**
 * Custom hook to fetch a single event by ID using React Query
 * @param id - Event ID
 */
interface UseEventByIdOptions {
	initialData?: Event;
	enabled?: boolean;
}

/**
 * The one query on the event page is kept live: a client here is one date and one click away
 * from booking, and spots that fill up on another device should show up before they submit
 * rather than surface only as a NOT_ENOUGH_SPOTS error after they have filled in the form. The
 * server still checks again at booking time either way — this just keeps the UI honest.
 */
export const useEventById = (id: string, options?: UseEventByIdOptions) => {
	return useQuery<Event>({
		queryKey: ['event', id],
		queryFn: () => eventApi.getEventById(id),
		gcTime: 1000 * 60 * 10,
		retry: 1,
		...PUBLIC_LIVE_QUERY_OPTIONS,
		...options,
	});
};
