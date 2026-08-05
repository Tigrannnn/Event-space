import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	type AdminCancelBookingData,
	type Booking,
	type BookingFilters,
	type CreateManualBookingData,
	type EventFilters,
	type UserRoleType,
	type UserFilters,
	type CreateCategoryData,
	type UpdateCategoryData,
	type UpdateBookingData,
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

export const useUpdateBooking = () => {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();

	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateBookingData }) =>
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
		mutationFn: (occurrenceId: string) => adminApi.cancelOccurrence(occurrenceId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
		},
		onError: (error) => {
			const message = apiError(error, 'admin.cancelOccurrenceFailed')
			addToast(message, ToastType.ERROR)
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
