import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToastStore, ToastType } from '@/stores/toastStore';
import { type Event } from '@event-space/shared';
import { favoritesApi } from '../api/favorites.api';
import { useTranslation } from '@/hooks/translation';
import { useApiError } from '@/hooks/apiError';

const FAVORITES_QUERY_KEY = ['favorites'];
const getFavoriteStatusQueryKey = (eventId: string) => ['favorite-status', eventId] as const;

export const useGetFavorites = () => {
	return useQuery({
		queryKey: FAVORITES_QUERY_KEY,
		queryFn: () => favoritesApi.getFavorites(),
	});
};

export const useToggleFavorite = () => {
	const { addToast } = useToastStore();
	const queryClient = useQueryClient();
	const translate = useTranslation();
	const apiError = useApiError();

	return useMutation({
		mutationFn: ({ eventId, isFavorite }: { eventId: string; isFavorite: boolean }) =>
			isFavorite ? favoritesApi.removeFavorite(eventId) : favoritesApi.addFavorite(eventId),
		onMutate: async ({ eventId, isFavorite }) => {
			await Promise.all([
				queryClient.cancelQueries({ queryKey: FAVORITES_QUERY_KEY }),
				queryClient.cancelQueries({ queryKey: getFavoriteStatusQueryKey(eventId) }),
			]);

			const previousFavorites = queryClient.getQueryData<Event[]>(FAVORITES_QUERY_KEY) ?? [];
			const previousFavoriteStatus = queryClient.getQueryData<boolean>(
				getFavoriteStatusQueryKey(eventId),
			);

			queryClient.setQueryData<boolean>(getFavoriteStatusQueryKey(eventId), !isFavorite);

			queryClient.setQueryData<Event[]>(FAVORITES_QUERY_KEY, (current = []) => {
				if (isFavorite) {
					return current.filter((event) => event.id !== eventId);
				}

				return current;
			});

			addToast(
				isFavorite ? translate('favorites.removed') : translate('favorites.added'),
				ToastType.SUCCESS,
			);

			return { previousFavorites, previousFavoriteStatus };
		},
		onSuccess: async (_data) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY }),
				queryClient.invalidateQueries({ queryKey: ['events'] }),
				queryClient.invalidateQueries({ queryKey: ['event'] }),
			]);
		},
		onError: (error, vars, context) => {
			if (context?.previousFavorites) {
				queryClient.setQueryData(FAVORITES_QUERY_KEY, context.previousFavorites);
			}
			if (context?.previousFavoriteStatus !== undefined) {
				queryClient.setQueryData(
					getFavoriteStatusQueryKey(vars.eventId),
					context.previousFavoriteStatus,
				);
			}

			const message = apiError(error, 'favorites.failed');
			addToast(message, ToastType.ERROR);
		},
	});
};

export const useFavoritesCount = () => {
	const { data } = useGetFavorites();
	return (data ?? []).length;
};

export const useIsFavorite = (eventId?: string) => {
	const queryClient = useQueryClient();
	const { data } = useGetFavorites();
	const optimisticStatus = eventId
		? queryClient.getQueryData<boolean>(getFavoriteStatusQueryKey(eventId))
		: undefined;

	if (optimisticStatus !== undefined) {
		return optimisticStatus;
	}

	return Boolean(eventId && (data ?? []).some((event: Event) => event.id === eventId));
};
