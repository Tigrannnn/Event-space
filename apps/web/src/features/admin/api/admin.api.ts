import clientApi from '@/lib/client.api';
import { EVENT_UPLOAD_TIMEOUTS } from '@event-space/shared';
import type {
	Booking,
	BookingFilters,
	CreateManualBookingData,
	Event,
	EventFilters,
	PaginatedResponse,
	SafeUserData,
	UserRoleType,
	UserFilters,
	EventStatus,
	DashboardStats,
	BookingWithDetails,
} from '@event-space/shared';

export const adminApi = {
	getStats: () => clientApi.get<DashboardStats>('/admin/stats'),
	getBookings: (params?: BookingFilters) =>
		clientApi.get<PaginatedResponse<Booking>>('/admin/bookings', { params }),
	updateBookingStatus: (id: string, status: Booking['status']) =>
		clientApi.patch<Booking>(`/admin/bookings/${id}/status`, { status }),
	getBookingByReference: (ref: number) =>
		clientApi.get<BookingWithDetails>(`/admin/bookings/by-reference/${ref}`),
	checkInBooking: (id: string) =>
		clientApi.post<Booking>(`/admin/bookings/${id}/checkin`),
	getEvents: (params?: EventFilters) =>
		clientApi.get<PaginatedResponse<Event>>('/admin/events', { params }),
	createEvent: (formData: FormData) =>
		clientApi.post<Event>('/events', formData, {
			timeout: EVENT_UPLOAD_TIMEOUTS.CLIENT_MUTATION_MS,
		}),
	updateEvent: (id: string, formData: FormData) =>
		clientApi.put<Event>(`/events/${id}`, formData, {
			timeout: EVENT_UPLOAD_TIMEOUTS.CLIENT_MUTATION_MS,
		}),
	deleteEvent: (id: string) => clientApi.delete<Event>(`/events/${id}`),
	getUsers: (params?: UserFilters) =>
		clientApi.get<PaginatedResponse<SafeUserData>>('/admin/users', { params }),
	updateUserRole: (id: string, role: UserRoleType) =>
		clientApi.patch<SafeUserData>(`/admin/users/${id}/role`, { role }),
	deleteUser: (id: string) => clientApi.delete<{ message: string }>(`/admin/users/${id}`),
	createManualBooking: (data: CreateManualBookingData) =>
		clientApi.post<Booking>('/admin/bookings/manual', data),
};
