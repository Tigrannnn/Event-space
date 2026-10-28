import clientApi from '@/lib/client.api';
import type {
	SearchHistoryItem,
	SearchSuggestedEvent,
	SearchSuggestions,
} from '@event-space/shared';

export const searchApi = {
	getSuggestions: (query: string) =>
		clientApi
			.get<SearchSuggestions>('/search/suggestions', { params: { q: query } })
			.then((res) => res.data),

	getRecommended: () =>
		clientApi.get<SearchSuggestedEvent[]>('/search/recommended').then((res) => res.data),

	getHistory: () => clientApi.get<SearchHistoryItem[]>('/search/history').then((res) => res.data),

	recordQuery: (query: string) => clientApi.post('/search/history', { query }),

	forgetQuery: (id: string) => clientApi.delete(`/search/history/${id}`),
};
