import clientApi from '@/lib/client.api';
import type {
	Booking,
	BookingFilters,
	CreateEventData,
	Event,
	EventFilters,
	PaginatedResponse,
	SafeUserData,
	UpdateEventData,
	UserRoleType,
	UserFilters,
	EventStatus,
	DashboardStats,
} from '@event-space/shared';

export const adminApi = {
	getStats: () => clientApi.get<DashboardStats>('/admin/stats'),
	getBookings: (params?: BookingFilters) =>
		clientApi.get<PaginatedResponse<Booking>>('/admin/bookings', { params }),
	updateBookingStatus: (id: string, status: Booking['status']) =>
		clientApi.patch<Booking>(`/admin/bookings/${id}/status`, { status }),
	getEvents: (params?: EventFilters) =>
		clientApi.get<PaginatedResponse<Event>>('/admin/events', { params }),
	createEvent: (data: CreateEventData) => clientApi.post<Event>('/events', data),
	updateEvent: (id: string, data: UpdateEventData) => clientApi.put<Event>(`/events/${id}`, data),
	updateEventStatus: (id: string, status: EventStatus) =>
		clientApi.put<Event>(`/events/${id}`, { status }),
	deleteEvent: (id: string) => clientApi.delete<Event>(`/events/${id}`),
	getUsers: (params?: UserFilters) =>
		clientApi.get<PaginatedResponse<SafeUserData>>('/admin/users', { params }),
	updateUserRole: (id: string, role: UserRoleType) =>
		clientApi.patch<SafeUserData>(`/admin/users/${id}/role`, { role }),
	deleteUser: (id: string) => clientApi.delete<{ message: string }>(`/admin/users/${id}`),
};
