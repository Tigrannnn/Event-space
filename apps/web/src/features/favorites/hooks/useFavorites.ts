import { useIsSignedIn } from '@/features/users/hooks/useUsers';
import {
	type InfiniteData,
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import { useToastStore, ToastType } from '@/stores/toastStore';
import { favoritesApi, type FavoritesPage } from '../api/favorites.api';
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
	const isSignedIn = useIsSignedIn();

	return useQuery({
		enabled: isSignedIn,
		retry: false,
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

const TOGGLE_KEY = ['favorites', 'toggle'];

type FavoritesList = InfiniteData<FavoritesPage>;

export const useToggleFavorite = () => {
	const { addToast } = useToastStore();
	const queryClient = useQueryClient();
	const translate = useTranslation();
	const apiError = useApiError();

	return useMutation({
		mutationKey: TOGGLE_KEY,
		// One at a time and in click order: ten quick taps become ten requests that alternate
		// add and remove, so the server ends up exactly where the heart ended up.
		scope: { id: 'favorites' },
		mutationFn: ({ eventId, isFavorite }: { eventId: string; isFavorite: boolean }) =>
			isFavorite ? favoritesApi.removeFavorite(eventId) : favoritesApi.addFavorite(eventId),
		onMutate: async ({ eventId, isFavorite }) => {
			await queryClient.cancelQueries({ queryKey: FAVORITES_KEY });

			const previousIds = queryClient.getQueryData<string[]>(FAVORITE_IDS_KEY);
			const previousList = queryClient.getQueryData<FavoritesList>(FAVORITES_LIST_KEY);

			queryClient.setQueryData<string[]>(FAVORITE_IDS_KEY, (current = []) =>
				isFavorite
					? current.filter((id) => id !== eventId)
					: current.includes(eventId)
						? current
						: [eventId, ...current],
			);

			// A card taken off the favourites page leaves it at once instead of after the server
			// answers. Adding has nothing to show yet: the list refills once the taps settle.
			if (isFavorite) {
				queryClient.setQueryData<FavoritesList>(
					FAVORITES_LIST_KEY,
					(current) =>
						current && {
							...current,
							pages: current.pages.map((page) => ({
								...page,
								data: page.data.filter((event) => event.id !== eventId),
							})),
						},
				);
			}

			addToast(
				isFavorite ? translate('favorites.removed') : translate('favorites.added'),
				ToastType.SUCCESS,
			);

			return { previousIds, previousList };
		},
		onError: (error, _vars, context) => {
			if (context?.previousIds) {
				queryClient.setQueryData(FAVORITE_IDS_KEY, context.previousIds);
			}
			if (context?.previousList) {
				queryClient.setQueryData(FAVORITES_LIST_KEY, context.previousList);
			}

			addToast(apiError(error, 'favorites.failed'), ToastType.ERROR);
		},
		// Refetching while other taps are still on their way would put back an answer that is
		// already out of date, so the cache is reconciled once, after the last one.
		onSettled: () => {
			if (queryClient.isMutating({ mutationKey: TOGGLE_KEY }) > 1) return;

			void queryClient.invalidateQueries({ queryKey: FAVORITES_KEY });
			void queryClient.invalidateQueries({ queryKey: ['events'] });
			void queryClient.invalidateQueries({ queryKey: ['event'] });
		},
	});
};
