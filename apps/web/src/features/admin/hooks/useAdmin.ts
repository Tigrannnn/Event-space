import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	getApiErrorMessage,
	type AdminCancelBookingData,
	type Booking,
	type BookingFilters,
	type CreateManualBookingData,
	type EventFilters,
	type UserRoleType,
	type UserFilters,
	type CreateCategoryData,
	type UpdateCategoryData,
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
		onSuccess: async () => {
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
	});
};

export const useCancelBookingByAdmin = () => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: AdminCancelBookingData }) =>
			adminApi.cancelBookingByAdmin(id, data),
		onSuccess: async () => {
			addToast('Booking cancelled successfully', ToastType.SUCCESS);
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
			addToast(getApiErrorMessage(error, 'Failed to cancel booking'), ToastType.ERROR);
		},
	});
};

export const useCreateEvent = () => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();

	return useMutation({
		mutationFn: (formData: FormData) => adminApi.createEvent(formData),
		onSuccess: async () => {
			addToast('Event created successfully', ToastType.SUCCESS);
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
		onSuccess: async () => {
			addToast('Event updated successfully', ToastType.SUCCESS);
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
			addToast(getApiErrorMessage(error, 'Failed to update event'), ToastType.ERROR);
		},
	});
};

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
		onSuccess: async () => {
			addToast('Manual booking created successfully', ToastType.SUCCESS);
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
			addToast(getApiErrorMessage(error, 'Failed to create manual booking'), ToastType.ERROR);
		},
	});
};

export const useAdminCategories = (params?: { skip?: number; limit?: number; search?: string }) => {
	return useQuery({
		queryKey: ['admin', 'categories', params],
		queryFn: () => adminApi.getCategories(params),
	});
};

export const useCreateCategory = () => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();

	return useMutation({
		mutationFn: (data: CreateCategoryData) => adminApi.createCategory(data),
		onSuccess: async () => {
			addToast('Category created successfully', ToastType.SUCCESS);
			closeModal();
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }),
				queryClient.invalidateQueries({ queryKey: ['categories'] }),
			]);
		},
		onError: (error) => {
			addToast(getApiErrorMessage(error, 'Failed to create category'), ToastType.ERROR);
		},
	});
};

export const useUpdateCategory = () => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateCategoryData }) => adminApi.updateCategory(id, data),
		onSuccess: async () => {
			addToast('Category updated successfully', ToastType.SUCCESS);
			closeModal();
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }),
				queryClient.invalidateQueries({ queryKey: ['categories'] }),
			]);
		},
		onError: (error) => {
			addToast(getApiErrorMessage(error, 'Failed to update category'), ToastType.ERROR);
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
