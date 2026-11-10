import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SearchHistoryItem } from '@event-space/shared';
import { searchApi } from '../api/search.api';

export const SEARCH_HISTORY_KEY = ['search', 'history'];

// Mirrors what the list shows: the server keeps the six latest distinct searches.
const HISTORY_SHOWN = 6;
const TEMPORARY_ID_PREFIX = 'pending-';

const normalize = (query: string) => query.trim().toLowerCase().replace(/\s+/g, ' ');

/**
 * Both changes show in the list the moment they are made and the server catches up behind:
 * the list is edited in the cache first and put back if the request fails, and it is read
 * from the server again once the request settles, which swaps any stand-in for the real row.
 */
export function useForgetSearchQuery() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) =>
			id.startsWith(TEMPORARY_ID_PREFIX) ? Promise.resolve() : searchApi.forgetQuery(id).then(() => undefined),
		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: SEARCH_HISTORY_KEY });
			const previous = queryClient.getQueryData<SearchHistoryItem[]>(SEARCH_HISTORY_KEY);
			queryClient.setQueryData<SearchHistoryItem[]>(SEARCH_HISTORY_KEY, (items) =>
				items?.filter((item) => item.id !== id),
			);
			return { previous };
		},
		onError: (_error, _id, context) => {
			if (context?.previous) queryClient.setQueryData(SEARCH_HISTORY_KEY, context.previous);
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey: SEARCH_HISTORY_KEY }),
	});
}

export function useRecordSearchQuery() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (query: string) => searchApi.recordQuery(query).then(() => undefined),
		onMutate: async (query) => {
			await queryClient.cancelQueries({ queryKey: SEARCH_HISTORY_KEY });
			const previous = queryClient.getQueryData<SearchHistoryItem[]>(SEARCH_HISTORY_KEY);
			const text = query.trim();
			queryClient.setQueryData<SearchHistoryItem[]>(SEARCH_HISTORY_KEY, (items) => {
				if (!items) return items;
				const rest = items.filter((item) => normalize(item.query) !== normalize(text));
				return [{ id: `${TEMPORARY_ID_PREFIX}${Date.now()}`, query: text }, ...rest].slice(0, HISTORY_SHOWN);
			});
			return { previous };
		},
		onError: (_error, _query, context) => {
			if (context?.previous) queryClient.setQueryData(SEARCH_HISTORY_KEY, context.previous);
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey: SEARCH_HISTORY_KEY }),
	});
}
