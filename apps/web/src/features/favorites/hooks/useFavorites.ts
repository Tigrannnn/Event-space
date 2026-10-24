import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToastStore, ToastType } from '@/stores/toastStore';
import { favoritesApi } from '../api/favorites.api';
import { useTranslation } from '@/hooks/translation';
import { useApiError } from '@/hooks/apiError';

const FAVORITES_KEY = ['favorites'];
const FAVORITES_LIST_KEY = ['favorites', 'list'];
const FAVORITE_IDS_KEY = ['favorites', 'ids'];

/** The saved events themselves, a page at a time — only the favourites page needs these. */
export const useGetFavorites = () => {
	return useInfiniteQuery({
		queryKey: FAVORITES_LIST_KEY,
		queryFn: ({ pageParam }) => favoritesApi.getFavorites({ cursor: pageParam }),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});
};

/**
 * Just the ids, which is all the heart on a card and the counter in the header ever needed.
 *
 * They live on every page of the site, so this is the query that must stay cheap; the list
 * above drags in each event with its pictures, translations and dates.
 */
export const useFavoriteIds = () => {
	return useQuery({
		queryKey: FAVORITE_IDS_KEY,
		queryFn: () => favoritesApi.getFavoriteIds(),
		staleTime: 60 * 1000,
	});
};

export const useFavoritesCount = () => {
	const { data } = useFavoriteIds();

	return data?.length ?? 0;
};

export const useIsFavorite = (eventId?: string) => {
	const { data } = useFavoriteIds();

	return Boolean(eventId && data?.includes(eventId));
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
			await queryClient.cancelQueries({ queryKey: FAVORITE_IDS_KEY });

			const previousIds = queryClient.getQueryData<string[]>(FAVORITE_IDS_KEY);

			// The ids drive the heart and the counter, so they flip at once; the list of events
			// is refetched after the server answers, which only the favourites page is watching.
			queryClient.setQueryData<string[]>(FAVORITE_IDS_KEY, (current = []) =>
				isFavorite ? current.filter((id) => id !== eventId) : [eventId, ...current],
			);

			addToast(
				isFavorite ? translate('favorites.removed') : translate('favorites.added'),
				ToastType.SUCCESS,
			);

			return { previousIds };
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: FAVORITES_KEY }),
				queryClient.invalidateQueries({ queryKey: ['events'] }),
				queryClient.invalidateQueries({ queryKey: ['event'] }),
			]);
		},
		onError: (error, _vars, context) => {
			if (context?.previousIds) {
				queryClient.setQueryData(FAVORITE_IDS_KEY, context.previousIds);
			}

			addToast(apiError(error, 'favorites.failed'), ToastType.ERROR);
		},
	});
};
