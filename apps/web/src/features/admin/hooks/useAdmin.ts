import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
	Booking,
	BookingFilters,
	CreateEventData,
	Event,
	EventFilters,
	UpdateEventData,
	UserRoleType,
	UserFilters,
} from '@event-space/shared';
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

	return useMutation({
		mutationFn: (data: CreateEventData) => adminApi.createEvent(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
			queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
			queryClient.invalidateQueries({ queryKey: ['events'] });
		},
	});
};

export const useUpdateEvent = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateEventData }) =>
			adminApi.updateEvent(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
			queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
			queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
			queryClient.invalidateQueries({ queryKey: ['events'] });
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
