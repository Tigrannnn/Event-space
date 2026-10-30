import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../api/bookings.api';
import {
	type BookingDisplayStatus,
	ChangeQuantityData,
	CreateBookingData,
	CreateGuestBookingData,
} from '@event-space/shared';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { useModalStore } from '@/stores';
import { useApiError } from '@/hooks/apiError';
import { useTranslation } from '@/hooks/translation';

/**
 * The visitor's bookings, a page at a time.
 *
 * The status filter is a query parameter rather than a `.filter()` over what arrived: filtering
 * a loaded page would leave the list empty whenever the first page happens to hold none of the
 * chosen status, while later pages still have plenty.
 */
export const useMyBookings = (status?: BookingDisplayStatus) => {
	return useInfiniteQuery({
		queryKey: ['my-bookings', 'list', status ?? 'ALL'],
		queryFn: ({ pageParam }) => bookingApi.getMyBookings({ cursor: pageParam, status }),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});
};

/**
 * The cheap counters every page needs: the header badge and the dates already booked.
 *
 * Kept apart from the list because the list pays two Stripe calls per booking to work out a
 * refund estimate, and nothing outside the bookings page has any use for that.
 */
export const useMyBookingsSummary = () => {
	return useQuery({
		queryKey: ['my-bookings', 'summary'],
		queryFn: () => bookingApi.getMyBookingsSummary(),
		staleTime: 60 * 1000,
	});
};

export const useActiveBookingsCount = () => {
	const { data } = useMyBookingsSummary();

	return data?.activeCount ?? 0;
};

/** Whether the visitor already holds a confirmed booking for this date. */
export const useHasBookingForOccurrence = () => {
	const { data, isLoading } = useMyBookingsSummary();
	const booked = data?.confirmedOccurrenceIds;

	return {
		isLoading,
		hasBooking: (occurrenceId?: string | null) =>
			Boolean(occurrenceId && booked?.includes(occurrenceId)),
	};
};

export const useCreateBooking = () => {
	const { addToast } = useToastStore();
	const queryClient = useQueryClient();
	const apiError = useApiError();

	return useMutation({
		mutationFn: (data: CreateBookingData) => bookingApi.createBooking(data),
		onError: (error) => {
			const message = apiError(error, 'booking.createFailed');
			addToast(message, ToastType.ERROR);
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['events'] }),
				queryClient.invalidateQueries({ queryKey: ['event'] }),
				// The booking form's phone number is saved onto the account when it has
				// none, so the profile is stale the moment a booking is created.
				queryClient.invalidateQueries({ queryKey: ['me'] }),
			]);
		},
	});
};

/** A booking without an account: the same as above, for someone who gave a name and an email. */
export const useCreateGuestBooking = () => {
	const { addToast } = useToastStore();
	const queryClient = useQueryClient();
	const apiError = useApiError();

	return useMutation({
		mutationFn: (data: CreateGuestBookingData) => bookingApi.createGuestBooking(data),
		onError: (error) => {
			addToast(apiError(error, 'booking.createFailed'), ToastType.ERROR);
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['events'] }),
				queryClient.invalidateQueries({ queryKey: ['event'] }),
			]);
		},
	});
};

/** One booking behind the link in its email (or behind the sign-in, when there is no link). */
export const useBookingView = (bookingId: string, token?: string) => {
	return useQuery({
		queryKey: ['booking-view', bookingId],
		queryFn: () => bookingApi.getBookingView(bookingId, token),
		retry: false,
	});
};

export const useQuantityQuote = (
	bookingId: string | undefined,
	quantity: number,
	enabled = true,
	token?: string,
) => {
	return useQuery({
		queryKey: ['quantity-quote', bookingId, quantity],
		queryFn: () => bookingApi.quoteQuantity(bookingId as string, { quantity }, token),
		enabled: enabled && Boolean(bookingId),
		retry: false,
		staleTime: 0,
		gcTime: 0,
	});
};

/**
 * Checks a promo code before any money moves. `code` is only set once the visitor commits
 * to it (presses "apply"), not on every keystroke — so a half-typed code never fires a
 * request, and nothing is spent: the booking is what actually redeems the code.
 */
export const usePromoCodeQuote = (
	occurrenceId: string | undefined,
	quantity: number,
	code: string | null,
) => {
	return useQuery({
		queryKey: ['promo-code-quote', occurrenceId, quantity, code],
		queryFn: () =>
			bookingApi.validatePromoCode({ occurrenceId: occurrenceId as string, quantity, code: code as string }),
		enabled: Boolean(occurrenceId && code),
		retry: false,
		staleTime: 0,
		gcTime: 0,
	});
};

export const useStartQuantityPayment = (token?: string) => {
	const { addToast } = useToastStore();
	const apiError = useApiError();

	return useMutation({
		mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
			bookingApi.startQuantityPayment(id, { quantity }, token),
		onError: (error) => {
			addToast(apiError(error, 'booking.updateFailed'), ToastType.ERROR);
		},
	});
};

export const useChangeQuantity = (token?: string) => {
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();
	const queryClient = useQueryClient();
	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: ChangeQuantityData }) =>
			bookingApi.changeQuantity(id, data, token),
		onSuccess: async () => {
			addToast(translate('booking.updateSuccess'), ToastType.SUCCESS);
			closeModal();
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['booking-view'] }),
				queryClient.invalidateQueries({ queryKey: ['event'] }),
				queryClient.invalidateQueries({ queryKey: ['events'] }),
			]);
		},
		onError: async (error) => {
			addToast(apiError(error, 'booking.updateFailed'), ToastType.ERROR);
			await queryClient.invalidateQueries({ queryKey: ['quantity-quote'] });
		},
	});
};

export const useAcceptReschedule = (token?: string) => {
	const { addToast } = useToastStore();
	const queryClient = useQueryClient();
	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: (id: string) => bookingApi.acceptReschedule(id, token),
		onSuccess: async () => {
			addToast(translate('booking.dateAcceptedToast'), ToastType.SUCCESS);
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['booking-view'] }),
			]);
		},
		onError: (error) => {
			addToast(apiError(error, 'booking.dateAcceptFailed'), ToastType.ERROR);
		},
	});
};

export const useCancelBooking = (token?: string) => {
	const { addToast } = useToastStore();
	const queryClient = useQueryClient();
	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: (id: string) => bookingApi.cancelBooking(id, token),
		onSuccess: async () => {
			addToast(translate('booking.cancelSuccess'), ToastType.SUCCESS);
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['booking-view'] }),
				// event id may not be present on response; invalidate event queries broadly
				queryClient.invalidateQueries({ queryKey: ['event'] }),
				queryClient.invalidateQueries({ queryKey: ['events'] }),
			]);
		},
		onError: (error) => {
			const message = apiError(error, 'booking.cancelFailed');
			addToast(message, ToastType.ERROR);
		},
	});
};
