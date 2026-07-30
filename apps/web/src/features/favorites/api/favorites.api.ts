import clientApi from '@/lib/client.api';
import type { EventWithFavoriteStatus } from '@event-space/shared';

export interface FavoriteToggleResponse {
	favorited: boolean;
}

export const favoritesApi = {
	getFavorites: () => clientApi.get<EventWithFavoriteStatus[]>('/favorites').then((res) => res.data),
	addFavorite: (eventId: string) =>
		clientApi.post<FavoriteToggleResponse>(`/favorites/${eventId}`).then((res) => res.data),
	removeFavorite: (eventId: string) =>
		clientApi.delete<FavoriteToggleResponse>(`/favorites/${eventId}`).then((res) => res.data),
};
