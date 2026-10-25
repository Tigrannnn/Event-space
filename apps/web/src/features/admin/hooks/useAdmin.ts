import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	type AdminCancelBookingData,
	type ChangeQuantityData,
	type QuantitySettlement,
	type RefundMethod,
	type ConfirmBookingManuallyData,
	type BookingFilters,
	type CancellationReasons,
	type CreateManualBookingData,
	type EventFilters,
	type UserRoleType,
	type UserFilters,
	type CreateCategoryData,
	type UpdateCategoryData,
	type UpdateShadowUserData,
	type ModerateReviewData,
	type ReplyToReviewData,
	type ReviewStatus,
} from '@event-space/shared';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { useModalStore } from '@/stores';
import { adminApi } from '../api/admin.api';
import { useApiError } from '@/hooks/apiError';
import { useTranslation } from '@/hooks/translation';

export const useStats = () => {
	return useQuery({
		queryKey: ['admin', 'stats'],
		queryFn: () => adminApi.getStats(),
	});
};

export const useDashboardFlow = (from: string, to: string) => {
	return useQuery({
		queryKey: ['admin', 'stats', 'flow', from, to],
		queryFn: () => adminApi.getDashboardFlow(from, to),
	});
};

export const useDashboardRevenue = (from: string, to: string) => {
	return useQuery({
		queryKey: ['admin', 'stats', 'revenue', from, to],
		queryFn: () => adminApi.getDashboardRevenue(from, to),
	});
};

export const useDashboardExpectedTimeline = (from: string, to: string) => {
	return useQuery({
		queryKey: ['admin', 'stats', 'revenue', 'timeline', from, to],
		queryFn: () => adminApi.getDashboardExpectedTimeline(from, to),
	});
};

export const useDashboardSnapshots = (from: string, to: string, options?: { enabled?: boolean }) => {
	return useQuery({
		queryKey: ['admin', 'stats', 'snapshots', from, to],
		queryFn: () => adminApi.getDashboardSnapshots(from, to),
		enabled: options?.enabled ?? true,
	});
};

export const useBookingState = (from: string, to: string, options?: { enabled?: boolean }) => {
	return useQuery({
		queryKey: ['admin', 'stats', 'booking-state', from, to],
		queryFn: () => adminApi.getBookingState(from, to),
		enabled: options?.enabled ?? true,
	});
};

export const useBookingCohort = (from: string, to: string) => {
	return useQuery({
		queryKey: ['admin', 'stats', 'booking-cohort', from, to],
		queryFn: () => adminApi.getBookingCohort(from, to),
	});
};

export const useAdminUsers = (params?: UserFilters, options?: { enabled?: boolean }) => {
	return useQuery({
		queryKey: ['admin', 'users', params],
		queryFn: () => adminApi.getUsers(params),
		enabled: options?.enabled ?? true,
	});
};

export const useAdminEvents = (params?: EventFilters, options?: { enabled?: boolean }) => {
	return useQuery({
		queryKey: ['admin', 'events', params],
		queryFn: () => adminApi.getEvents(params),
		enabled: options?.enabled ?? true,
	});
};

export const useAdminBookings = (params?: BookingFilters, options?: { enabled?: boolean }) => {
	return useQuery({
		queryKey: ['admin', 'bookings', params],
		queryFn: () => adminApi.getBookings(params),
		enabled: options?.enabled ?? true,
	});
};

export const useCancelBookingByAdmin = () => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();

	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: AdminCancelBookingData }) =>
			adminApi.cancelBookingByAdmin(id, data),
		onSuccess: async () => {
			addToast(translate('admin.cancelBookingSuccess'), ToastType.SUCCESS);
			closeModal();
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
				queryClient.invalidateQueries({ queryKey: ['bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['events'] }),
				queryClient.invalidateQueries({ queryKey: ['event'] }),
			]);
		},
		onError: (error) => {
			addToast(apiError(error, 'admin.cancelBookingFailed'), ToastType.ERROR);
		},
	});
};

export const useConfirmBookingManually = () => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();

	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: ConfirmBookingManuallyData }) =>
			adminApi.confirmBookingManually(id, data),
		onSuccess: async () => {
			addToast(translate('admin.confirmBookingSuccess'), ToastType.SUCCESS);
			closeModal();
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
				queryClient.invalidateQueries({ queryKey: ['bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['events'] }),
				queryClient.invalidateQueries({ queryKey: ['event'] }),
			]);
		},
		onError: (error) => {
			addToast(apiError(error, 'admin.confirmBookingFailed'), ToastType.ERROR);
		},
	});
};

export const useCheckInBooking = () => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();

	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: (id: string) => adminApi.checkInBooking(id),
		onSuccess: async () => {
			addToast(translate('admin.checkedInSuccessfully'), ToastType.SUCCESS);
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
				queryClient.invalidateQueries({ queryKey: ['bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
			]);
		},
		onError: (error) => {
			addToast(apiError(error, 'admin.failedToCheckIn'), ToastType.ERROR);
		},
	});
};

export const useUndoBookingCheckIn = () => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();

	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: (id: string) => adminApi.undoBookingCheckIn(id),
		onSuccess: async () => {
			addToast(translate('admin.checkInUndone'), ToastType.SUCCESS);
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
				queryClient.invalidateQueries({ queryKey: ['bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
			]);
		},
		onError: (error) => {
			addToast(apiError(error, 'admin.failedToUndoCheckIn'), ToastType.ERROR);
		},
	});
};

export const useAdminQuantityQuote = (
	bookingId: string | undefined,
	quantity: number,
	settlement: QuantitySettlement,
	refundMethod: RefundMethod,
	enabled = true,
) => {
	return useQuery({
		queryKey: ['admin', 'quantity-quote', bookingId, quantity, settlement, refundMethod],
		queryFn: () =>
			adminApi.quoteBookingQuantity(bookingId as string, { quantity, settlement, refundMethod }),
		enabled: enabled && Boolean(bookingId),
		retry: false,
		staleTime: 0,
		gcTime: 0,
	});
};

export const useUpdateBooking = () => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();

	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: ChangeQuantityData }) =>
			adminApi.updateBooking(id, data),
		onSuccess: async () => {
			addToast(translate('admin.updateBookingSuccess'), ToastType.SUCCESS);
			closeModal();
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
				queryClient.invalidateQueries({ queryKey: ['bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['events'] }),
				queryClient.invalidateQueries({ queryKey: ['event'] }),
			]);
		},
		onError: (error) => {
			addToast(apiError(error, 'admin.updateBookingFailed'), ToastType.ERROR);
		},
	});
};

export const useCreateEvent = () => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();

	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: (formData: FormData) => adminApi.createEvent(formData),
		onSuccess: async () => {
			addToast(translate('admin.createEventSuccess'), ToastType.SUCCESS);
			closeModal();
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['admin', 'events'] }),
				queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
				queryClient.invalidateQueries({ queryKey: ['bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['events'] }),
				queryClient.invalidateQueries({ queryKey: ['event'] }),
			]);
		},
		onError: (error) => {
			addToast(apiError(error, 'admin.createEventFailed'), ToastType.ERROR);
		},
	});
};

export const useUpdateEvent = () => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();

	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
			adminApi.updateEvent(id, formData),
		onSuccess: async () => {
			addToast(translate('admin.updateEventSuccess'), ToastType.SUCCESS);
			closeModal();
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['admin', 'events'] }),
				queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
				queryClient.invalidateQueries({ queryKey: ['bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['events'] }),
				queryClient.invalidateQueries({ queryKey: ['event'] }),
			]);
		},
		onError: (error) => {
			addToast(apiError(error, 'admin.updateEventFailed'), ToastType.ERROR);
		},
	});
};

export function useCancelOccurrence() {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();

	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: ({
			occurrenceId,
			reasons,
		}: {
			occurrenceId: string;
			reasons?: CancellationReasons;
		}) => adminApi.cancelOccurrence(occurrenceId, reasons),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
		},
		onError: (error) => {
			const message = apiError(error, 'admin.cancelOccurrenceFailed')
			addToast(message, ToastType.ERROR)
		},
	});
}

export function useRescheduleOccurrence() {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();

	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: ({
			occurrenceId,
			date,
			reasons,
		}: {
			occurrenceId: string;
			date: string;
			reasons?: CancellationReasons;
		}) => adminApi.rescheduleOccurrence(occurrenceId, date, reasons),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['admin', 'events'] }),
				queryClient.invalidateQueries({ queryKey: ['bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['events'] }),
				queryClient.invalidateQueries({ queryKey: ['event'] }),
			]);
			addToast(translate('admin.occurrenceRescheduled'), ToastType.SUCCESS);
		},
		onError: (error) => {
			addToast(apiError(error, 'admin.occurrenceRescheduleFailed'), ToastType.ERROR);
		},
	});
}

export const useDeleteEvent = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => adminApi.deleteEvent(id),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['admin', 'events'] }),
				queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
				queryClient.invalidateQueries({ queryKey: ['bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['events'] }),
				queryClient.invalidateQueries({ queryKey: ['event'] }),
			]);
		},
	});
};

export const useUpdateUserRole = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, role }: { id: string; role: UserRoleType }) =>
			adminApi.updateUserRole(id, role),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
		},
	});
};

export const useUpdateShadowUser = () => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();

	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateShadowUserData }) =>
			adminApi.updateShadowUser(id, data),
		onSuccess: async () => {
			addToast(translate('admin.updateGuestSuccess'), ToastType.SUCCESS);
			closeModal();
			await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
		},
		onError: (error) => {
			addToast(apiError(error, 'admin.updateGuestFailed'), ToastType.ERROR);
		},
	});
};

export const useCreateManualBooking = () => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();

	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: (data: CreateManualBookingData) => adminApi.createManualBooking(data),
		onSuccess: async () => {
			addToast(translate('admin.createManualBookingSuccess'), ToastType.SUCCESS);
			closeModal();
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['admin', 'events'] }),
				queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
				queryClient.invalidateQueries({ queryKey: ['bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['events'] }),
				queryClient.invalidateQueries({ queryKey: ['event'] }),
			]);
		},
		onError: (error) => {
			addToast(apiError(error, 'admin.createManualBookingFailed'), ToastType.ERROR);
		},
	});
};

export const useAdminCategories = (params?: { skip?: number; limit?: number; search?: string }, options?: { enabled?: boolean }) => {
	return useQuery({
		queryKey: ['admin', 'categories', params],
		queryFn: () => adminApi.getCategories(params),
		enabled: options?.enabled ?? true,
	});
};

export const useCreateCategory = () => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();

	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: (data: CreateCategoryData) => adminApi.createCategory(data),
		onSuccess: async () => {
			addToast(translate('admin.createCategorySuccess'), ToastType.SUCCESS);
			closeModal();
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }),
				queryClient.invalidateQueries({ queryKey: ['categories'] }),
			]);
		},
		onError: (error) => {
			addToast(apiError(error, 'admin.createCategoryFailed'), ToastType.ERROR);
		},
	});
};

export const useUpdateCategory = () => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();

	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateCategoryData }) =>
			adminApi.updateCategory(id, data),
		onSuccess: async () => {
			addToast(translate('admin.updateCategorySuccess'), ToastType.SUCCESS);
			closeModal();
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }),
				queryClient.invalidateQueries({ queryKey: ['categories'] }),
			]);
		},
		onError: (error) => {
			addToast(apiError(error, 'admin.updateCategoryFailed'), ToastType.ERROR);
		},
	});
};

export const useDeleteCategory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => adminApi.deleteCategory(id),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }),
				queryClient.invalidateQueries({ queryKey: ['categories'] }),
			]);
		},
	});
};

export const useAdminBanners = () => {
	return useQuery({
		queryKey: ['admin', 'banners'],
		queryFn: () => adminApi.getBanners(),
	});
};

const useBannerMutationCallbacks = (
	successKey: 'admin.createBannerSuccess' | 'admin.updateBannerSuccess',
	failureKey: 'admin.createBannerFailed' | 'admin.updateBannerFailed',
) => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();
	const apiError = useApiError();
	const translate = useTranslation();

	return {
		onSuccess: async () => {
			addToast(translate(successKey), ToastType.SUCCESS);
			closeModal();
			await queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
		},
		onError: (error: unknown) => {
			addToast(apiError(error, failureKey), ToastType.ERROR);
		},
	};
};

export const useCreateBanner = () => {
	const callbacks = useBannerMutationCallbacks(
		'admin.createBannerSuccess',
		'admin.createBannerFailed',
	);

	return useMutation({
		mutationFn: (formData: FormData) => adminApi.createBanner(formData),
		...callbacks,
	});
};

export const useUpdateBanner = () => {
	const callbacks = useBannerMutationCallbacks(
		'admin.updateBannerSuccess',
		'admin.updateBannerFailed',
	);

	return useMutation({
		mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
			adminApi.updateBanner(id, formData),
		...callbacks,
	});
};

export const useReorderBanners = () => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const apiError = useApiError();

	return useMutation({
		mutationFn: (ids: string[]) => adminApi.reorderBanners(ids),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
		},
		onError: (error) => {
			addToast(apiError(error, 'admin.updateBannerFailed'), ToastType.ERROR);
		},
	});
};

export const useDeleteBanner = () => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const apiError = useApiError();

	return useMutation({
		mutationFn: (id: string) => adminApi.deleteBanner(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
		},
		onError: (error) => {
			addToast(apiError(error, 'admin.deleteBannerFailed'), ToastType.ERROR);
		},
	});
};

export const useAdminReviews = (status?: ReviewStatus) => {
	return useInfiniteQuery({
		queryKey: ['admin', 'reviews', status ?? 'ALL'],
		queryFn: ({ pageParam }) => adminApi.getReviews({ status, cursor: pageParam }),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});
};

/** The number on the sidebar tab: how many reviews are waiting to be read. */
export const usePendingReviewsCount = () => {
	const { data } = useQuery({
		queryKey: ['admin', 'reviews', 'pending-count'],
		queryFn: () => adminApi.getPendingReviewsCount(),
		staleTime: 60 * 1000,
	});

	return data?.count ?? 0;
};

const useReviewMutationCallbacks = (failureKey: 'admin.reviewActionFailed') => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const apiError = useApiError();

	return {
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
				// The event's average changes with the verdict, so the catalogue is stale too.
				queryClient.invalidateQueries({ queryKey: ['events'] }),
				queryClient.invalidateQueries({ queryKey: ['event'] }),
				queryClient.invalidateQueries({ queryKey: ['reviews'] }),
			]);
		},
		onError: (error: unknown) => {
			addToast(apiError(error, failureKey), ToastType.ERROR);
		},
	};
};

export const useModerateReview = () => {
	const { addToast } = useToastStore();
	const translate = useTranslation();
	const callbacks = useReviewMutationCallbacks('admin.reviewActionFailed');

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: ModerateReviewData }) =>
			adminApi.moderateReview(id, data),
		...callbacks,
		onSuccess: async (review) => {
			addToast(
				translate(
					review.status === 'PUBLISHED' ? 'admin.reviewPublished' : 'admin.reviewRejected',
				),
				ToastType.SUCCESS,
			);
			await callbacks.onSuccess();
		},
	});
};

export const useReplyToReview = () => {
	const { addToast } = useToastStore();
	const translate = useTranslation();
	const callbacks = useReviewMutationCallbacks('admin.reviewActionFailed');

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: ReplyToReviewData }) =>
			adminApi.replyToReview(id, data),
		...callbacks,
		onSuccess: async () => {
			addToast(translate('admin.reviewReplySaved'), ToastType.SUCCESS);
			await callbacks.onSuccess();
		},
	});
};

export const useDeleteReview = () => {
	const callbacks = useReviewMutationCallbacks('admin.reviewActionFailed');

	return useMutation({
		mutationFn: (id: string) => adminApi.deleteReview(id),
		...callbacks,
	});
};
