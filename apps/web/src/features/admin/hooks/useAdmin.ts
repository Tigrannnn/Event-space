import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	getApiErrorMessage,
	type Booking,
	type BookingFilters,
	type CreateManualBookingData,
	type Event,
	type EventFilters,
	type UserRoleType,
	type UserFilters,
} from '@event-space/shared';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { useModalStore } from '@/stores';
import { adminApi } from '../api/admin.api';

export const useStats = () => {
	return useQuery({
		queryKey: ['admin', 'stats'],
		queryFn: () => adminApi.getStats(),
	});
};

export const useAdminUsers = (params?: UserFilters) => {
	return useQuery({
		queryKey: ['admin', 'users', params],
		queryFn: () => adminApi.getUsers(params),
	});
};

export const useAdminEvents = (params?: EventFilters) => {
	return useQuery({
		queryKey: ['admin', 'events', params],
		queryFn: () => adminApi.getEvents(params),
	});
};

export const useAdminBookings = (params?: BookingFilters) => {
	return useQuery({
		queryKey: ['admin', 'bookings', params],
		queryFn: () => adminApi.getBookings(params),
	});
};

export const useUpdateBookingStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, status }: { id: string; status: Booking['status'] }) =>
			adminApi.updateBookingStatus(id, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
			queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
			queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
			queryClient.invalidateQueries({ queryKey: ['bookings'] });
			queryClient.invalidateQueries({ queryKey: ['events'] });
		},
	});
};

export const useCreateEvent = () => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();

	return useMutation({
		mutationFn: (formData: FormData) => adminApi.createEvent(formData),
		onSuccess: () => {
			addToast('Event created successfully', ToastType.SUCCESS);
			closeModal();
			queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
			queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
			queryClient.invalidateQueries({ queryKey: ['events'] });
		},
		onError: (error) => {
			addToast(getApiErrorMessage(error, 'Failed to create event'), ToastType.ERROR);
		},
	});
};

export const useUpdateEvent = () => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();

	return useMutation({
		mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
			adminApi.updateEvent(id, formData),
		onSuccess: () => {
			addToast('Event updated successfully', ToastType.SUCCESS);
			closeModal();
			queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
			queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
			queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
			queryClient.invalidateQueries({ queryKey: ['events'] });
		},
		onError: (error) => {
			addToast(getApiErrorMessage(error, 'Failed to update event'), ToastType.ERROR);
		},
	});
};

export const useUpdateEventStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, status }: { id: string; status: Event['status'] }) =>
			adminApi.updateEventStatus(id, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
			queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
			queryClient.invalidateQueries({ queryKey: ['events'] });
		},
	});
};

export const useDeleteEvent = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => adminApi.deleteEvent(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
			queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
			queryClient.invalidateQueries({ queryKey: ['events'] });
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

export const useDeleteUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => adminApi.deleteUser(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
			queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
		},
	});
};

export const useCreateManualBooking = () => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();

	return useMutation({
		mutationFn: (data: CreateManualBookingData) => adminApi.createManualBooking(data),
		onSuccess: () => {
			addToast('Manual booking created successfully', ToastType.SUCCESS);
			closeModal();
			queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
			queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
			queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
			queryClient.invalidateQueries({ queryKey: ['bookings'] });
			queryClient.invalidateQueries({ queryKey: ['events'] });
		},
		onError: (error) => {
			addToast(getApiErrorMessage(error, 'Failed to create manual booking'), ToastType.ERROR);
		},
	});
};
