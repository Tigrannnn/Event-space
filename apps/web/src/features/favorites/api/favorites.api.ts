import clientApi from '@/lib/client.api';
import { FAVORITES_PAGE_SIZE } from '@event-space/shared';
import type { Event, PaginatedCursorResponse } from '@event-space/shared';

export interface FavoriteToggleResponse {
	favorited: boolean;
}

export type FavoritesPage = PaginatedCursorResponse<Event>;

export const favoritesApi = {
	getFavorites: ({ cursor, limit = FAVORITES_PAGE_SIZE }: { cursor?: string; limit?: number } = {}) =>
		clientApi
			.get<FavoritesPage>('/favorites', { params: { cursor, limit } })
			.then((res) => res.data),

	getFavoriteIds: () => clientApi.get<string[]>('/favorites/ids').then((res) => res.data),

	addFavorite: (eventId: string) =>
		clientApi.post<FavoriteToggleResponse>(`/favorites/${eventId}`).then((res) => res.data),

	removeFavorite: (eventId: string) =>
		clientApi.delete<FavoriteToggleResponse>(`/favorites/${eventId}`).then((res) => res.data),
};
