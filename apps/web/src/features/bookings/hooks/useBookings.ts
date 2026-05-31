import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../api/bookings.api';
import { CreateBookingData, getApiErrorMessage, UpdateBookingData } from '@event-space/shared';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { useModalStore } from '@/stores';

export const useGetMyBookings = () => {
	return useQuery({
		queryKey: ['my-bookings'],
		queryFn: () => bookingApi.getMyBookings(),
	});
};

export const useCreateBooking = () => {
	const { addToast } = useToastStore();

	return useMutation({
		mutationFn: (data: CreateBookingData) => bookingApi.createBooking(data),
		onError: (error) => {
			const message = getApiErrorMessage(error, 'Failed to create booking');
			addToast(message, ToastType.ERROR);
		},
	});
};

export const useUpdateBooking = () => {
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateBookingData }) =>
			bookingApi.updateBooking(id, data),
		onSuccess: (result) => {
			addToast('Booking updated successfully', ToastType.SUCCESS);
			closeModal();
			queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
			queryClient.invalidateQueries({ queryKey: ['event', result.eventId] });
			queryClient.invalidateQueries({ queryKey: ['events'] });
		},
		onError: (error) => {
			const message = getApiErrorMessage(error, 'Failed to update booking');
			addToast(message, ToastType.ERROR);
		},
	});
};

export const useCancelBooking = () => {
	const { addToast } = useToastStore();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => bookingApi.cancelBooking(id),
		onSuccess: (result) => {
			addToast('Booking cancelled successfully', ToastType.SUCCESS);
			queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
			queryClient.invalidateQueries({ queryKey: ['event', result.eventId] });
			queryClient.invalidateQueries({ queryKey: ['events'] });
		},
		onError: (error) => {
			const message = getApiErrorMessage(error, 'Failed to cancel booking');
			addToast(message, ToastType.ERROR);
		},
	});
};
