import { useInfiniteQuery, useQuery, InfiniteData } from '@tanstack/react-query';
import { Event } from '@event-space/shared';
import { eventApi, PaginatedEventsResponse } from '../api/events.api';

/**
 * Custom hook to fetch events using React Query with infinite scroll
 */
interface UseEventsOptions {
	limit?: number;
	search?: string;
	startDate?: string;
	endDate?: string;
	category?: string;
	initialData?: InfiniteData<PaginatedEventsResponse>;
}

export const useEvents = (options: UseEventsOptions = {}) => {
	const { limit = 8, search = '', startDate, endDate, category, initialData } = options;

	return useInfiniteQuery({
		queryKey: ['events', 'infinite', search, limit, startDate, endDate, category],
		queryFn: async ({ pageParam, signal }): Promise<PaginatedEventsResponse> => {
			return eventApi.getEvents(
				{
					cursor: pageParam as string | undefined,
					limit,
					search: search || undefined,
					startDate,
					endDate,
					category,
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
}

export const useEventById = (id: string, options?: UseEventByIdOptions) => {
	return useQuery<Event>({
		queryKey: ['event', id],
		queryFn: () => eventApi.getEventById(id),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
		retry: 1,
		...options,
	});
};
