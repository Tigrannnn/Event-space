import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../api/bookings.api';
import { CreateBookingData, UpdateBookingData } from '@event-space/shared';
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

export const useUpdateBooking = () => {
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();
	const queryClient = useQueryClient();
	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateBookingData }) =>
			bookingApi.updateBooking(id, data),
		onSuccess: async (result) => {
			addToast(translate('booking.updateSuccess'), ToastType.SUCCESS);
			closeModal();
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
				// event id may not be present on response; invalidate event queries broadly
				queryClient.invalidateQueries({ queryKey: ['event'] }),
				queryClient.invalidateQueries({ queryKey: ['events'] }),
			]);
		},
		onError: (error) => {
			const message = apiError(error, 'booking.updateFailed');
			addToast(message, ToastType.ERROR);
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
