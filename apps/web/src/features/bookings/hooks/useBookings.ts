import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../api/bookings.api';
import {
	getBookingDisplayStatus,
	type BookingWithEstimate,
	ChangeQuantityData,
	CreateBookingData,
} from '@event-space/shared';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { useModalStore } from '@/stores';
import { useApiError } from '@/hooks/apiError';
import { useTranslation } from '@/hooks/translation';

export const useGetMyBookings = () => {
	return useQuery({
		queryKey: ['my-bookings'],
		queryFn: () => bookingApi.getMyBookings(),
	});
};

const MINUTE_MS = 60 * 1000;

/**
 * Bookings still to be attended: paid, not checked in yet, and the tour has not finished.
 *
 * The badge in the header used to count every CONFIRMED booking, which also holds the ones
 * already attended and the ones whose tour is long over — so it never matched the list.
 */
export function countActiveBookings(
	bookings: Pick<BookingWithEstimate, 'status' | 'checkedInAt' | 'occurrence'>[],
	now: number = Date.now(),
): number {
	return bookings.filter((booking) => {
		if (getBookingDisplayStatus(booking) !== 'CONFIRMED') return false;
		if (!booking.occurrence) return true;

		const durationMs = (booking.occurrence.event?.duration ?? 0) * MINUTE_MS;
		return new Date(booking.occurrence.date).getTime() + durationMs > now;
	}).length;
}

export const useActiveBookingsCount = () => {
	const { data } = useQuery({
		queryKey: ['my-bookings'],
		queryFn: () => bookingApi.getMyBookings(),
		select: (bookings) => countActiveBookings(bookings),
	});

	return data ?? 0;
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

export const useQuantityQuote = (bookingId: string | undefined, quantity: number, enabled = true) => {
	return useQuery({
		queryKey: ['quantity-quote', bookingId, quantity],
		queryFn: () => bookingApi.quoteQuantity(bookingId as string, { quantity }),
		enabled: enabled && Boolean(bookingId),
		retry: false,
		staleTime: 0,
		gcTime: 0,
	});
};

export const useStartQuantityPayment = () => {
	const { addToast } = useToastStore();
	const apiError = useApiError();

	return useMutation({
		mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
			bookingApi.startQuantityPayment(id, { quantity }),
		onError: (error) => {
			addToast(apiError(error, 'booking.updateFailed'), ToastType.ERROR);
		},
	});
};

export const useChangeQuantity = () => {
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();
	const queryClient = useQueryClient();
	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: ChangeQuantityData }) =>
			bookingApi.changeQuantity(id, data),
		onSuccess: async () => {
			addToast(translate('booking.updateSuccess'), ToastType.SUCCESS);
			closeModal();
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
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

export const useAcceptReschedule = () => {
	const { addToast } = useToastStore();
	const queryClient = useQueryClient();
	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: (id: string) => bookingApi.acceptReschedule(id),
		onSuccess: async () => {
			addToast(translate('booking.dateAcceptedToast'), ToastType.SUCCESS);
			await queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
		},
		onError: (error) => {
			addToast(apiError(error, 'booking.dateAcceptFailed'), ToastType.ERROR);
		},
	});
};

export const useCancelBooking = () => {
	const { addToast } = useToastStore();
	const queryClient = useQueryClient();
	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: (id: string) => bookingApi.cancelBooking(id),
		onSuccess: async (result) => {
			addToast(translate('booking.cancelSuccess'), ToastType.SUCCESS);
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
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
