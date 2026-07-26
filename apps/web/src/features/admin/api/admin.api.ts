import clientApi from '@/lib/client.api';
import { EVENT_UPLOAD_TIMEOUTS } from '@event-space/shared';
import type {
	AdminCancelBookingData,
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
	Category,
	CreateCategoryData,
	UpdateCategoryData,
	BookingWithOccurrence,
	UpdateBookingData,
} from '@event-space/shared';

export const adminApi = {
	getStats: () => clientApi.get<DashboardStats>('/admin/stats').then((res) => res.data),
	getBookings: (params?: BookingFilters) =>
		clientApi
			.get<PaginatedResponse<BookingWithDetails>>('/admin/bookings', { params })
			.then((res) => res.data),
	updateBookingStatus: (id: string, status: Booking['status']) =>
		clientApi.patch<Booking>(`/admin/bookings/${id}/status`, { status }).then((res) => res.data),
	getBookingByReference: (ref: number) =>
		clientApi.get<BookingWithDetails>(`/admin/bookings/by-reference/${ref}`).then((res) => res.data),
	checkInBooking: (id: string) =>
		clientApi.post<Booking>(`/admin/bookings/${id}/checkin`).then((res) => res.data),
	updateBooking: (id: string, data: UpdateBookingData) =>
		clientApi.patch<BookingWithDetails>(`/admin/bookings/${id}`, data).then((res) => res.data),
	cancelBookingByAdmin: (id: string, data: AdminCancelBookingData) =>
		clientApi.post<Booking>(`/admin/bookings/${id}/cancel`, data).then((res) => res.data),
	getEvents: (params?: EventFilters) =>
		clientApi.get<PaginatedResponse<Event>>('/admin/events', { params }).then((res) => res.data),
	getEventById: (id: string) => clientApi.get<Event>(`/admin/events/${id}`).then((res) => res.data),
	createEvent: (formData: FormData) =>
		clientApi
			.post<Event>('/events', formData, {
				timeout: EVENT_UPLOAD_TIMEOUTS.CLIENT_MUTATION_MS,
			})
			.then((res) => res.data),
	updateEvent: (id: string, formData: FormData) =>
		clientApi
			.put<Event>(`/events/${id}`, formData, {
				timeout: EVENT_UPLOAD_TIMEOUTS.CLIENT_MUTATION_MS,
			})
			.then((res) => res.data),
	cancelOccurrence: (occurrenceId: string) =>
		clientApi.patch(`/admin/occurrences/${occurrenceId}/cancel`, {}).then((res) => res.data),
	deleteEvent: (id: string) => clientApi.delete<Event>(`/events/${id}`).then((res) => res.data),
	getUsers: (params?: UserFilters) =>
		clientApi
			.get<PaginatedResponse<SafeUserData>>('/admin/users', { params })
			.then((res) => res.data),
	getUserById: (id: string) =>
		clientApi.get<SafeUserData>(`/admin/users/${id}`).then((res) => res.data),
	getBookingById: (id: string) =>
		clientApi.get<BookingWithDetails>(`/admin/bookings/${id}`).then((res) => res.data),
	getCategoryById: (id: string) =>
		clientApi.get<Category>(`/admin/categories/${id}`).then((res) => res.data),
	updateUserRole: (id: string, role: UserRoleType) =>
		clientApi.patch<SafeUserData>(`/admin/users/${id}/role`, { role }).then((res) => res.data),
	createManualBooking: (data: CreateManualBookingData) =>
		clientApi.post<BookingWithOccurrence>('/admin/bookings/manual', data).then((res) => res.data),
	getCategories: (params?: { skip?: number; limit?: number; search?: string }) =>
		clientApi
			.get<PaginatedResponse<Category>>('/admin/categories', { params })
			.then((res) => res.data),
	createCategory: (data: CreateCategoryData) =>
		clientApi.post<Category>('/admin/categories', data).then((res) => res.data),
	updateCategory: (id: string, data: UpdateCategoryData) =>
		clientApi.patch<Category>(`/admin/categories/${id}`, data).then((res) => res.data),
	deleteCategory: (id: string) =>
		clientApi.delete<{ message: string }>(`/admin/categories/${id}`).then((res) => res.data),
};
