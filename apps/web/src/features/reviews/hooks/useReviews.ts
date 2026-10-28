import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateReviewData } from '@event-space/shared';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { useApiError } from '@/hooks/apiError';
import { useTranslation } from '@/hooks/translation';
import { reviewsApi } from '../api/reviews.api';

export const useEventReviews = (eventId: string) => {
	return useInfiniteQuery({
		queryKey: ['reviews', eventId],
		queryFn: ({ pageParam }) => reviewsApi.getForEvent(eventId, { cursor: pageParam }),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});
};

export const useMyReview = (bookingId: string, token?: string) => {
	return useQuery({
		queryKey: ['reviews', 'mine', bookingId],
		queryFn: () => reviewsApi.getMine(bookingId, token),
	});
};

/**
 * Saves a review, whether it is the first one or a correction.
 *
 * Both paths invalidate the same things: the booking list carries the review on its cards, and
 * the event's average may have just moved — which the catalogue and the event page both show.
 */
export const useSaveReview = (bookingId: string, token?: string) => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: ({ isUpdate, data }: { isUpdate: boolean; data: CreateReviewData }) =>
			isUpdate
				? reviewsApi.update(bookingId, data, token)
				: reviewsApi.create(bookingId, data, token),
		onSuccess: async (review) => {
			addToast(
				translate(review.status === 'PUBLISHED' ? 'review.savedLive' : 'review.savedPending'),
				ToastType.SUCCESS,
			);

			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['reviews'] }),
				queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['events'] }),
				queryClient.invalidateQueries({ queryKey: ['event'] }),
			]);
		},
		onError: (error) => {
			addToast(apiError(error, 'review.saveFailed'), ToastType.ERROR);
		},
	});
};

export const useDeleteMyReview = (bookingId: string, token?: string) => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: () => reviewsApi.remove(bookingId, token),
		onSuccess: async () => {
			addToast(translate('review.deleted'), ToastType.SUCCESS);

			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['reviews'] }),
				queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['events'] }),
				queryClient.invalidateQueries({ queryKey: ['event'] }),
			]);
		},
		onError: (error) => {
			addToast(apiError(error, 'review.deleteFailed'), ToastType.ERROR);
		},
	});
};
