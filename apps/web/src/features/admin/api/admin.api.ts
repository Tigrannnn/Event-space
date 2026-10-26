import clientApi from '@/lib/client.api';
import { EVENT_UPLOAD_TIMEOUTS } from '@event-space/shared';
import type {
	EventOccurrence,
	BookingQuantityChange,
	ChangeQuantityData,
	QuantityQuote,
	QuantityQuoteRequest,
	ConfirmBookingManuallyData,
	AdminCancelBookingData,
	Booking,
	BookingFilters,
	CreateManualBookingData,
	Event,
	EventFilters,
	PaginatedResponse,
	SafeUserData,
	UpdateShadowUserData,
	UserRoleType,
	UserFilters,
	EventStatus,
	DashboardStats,
	DashboardFlow,
	DashboardRevenue,
	DashboardExpectedTimeline,
	DashboardSnapshot,
	BookingStatePoint,
	CancellationReasons,
	BookingCohort,
	BookingWithDetails,
	Banner,
	Category,
	ModerateReviewData,
	PaginatedCursorResponse,
	ReplyToReviewData,
	Review,
	ReviewStatus,
	CreateCategoryData,
	UpdateCategoryData,
	BookingWithOccurrence,
	PromoCode,
	CreatePromoCodeData,
	UpdatePromoCodeData,
	CompensateBookingData,
	TransferBookingData,
} from '@event-space/shared';

/** A review as the moderation queue needs it: who wrote it, about what, and for which booking. */
export type AdminReview = Review & {
	user?: { id: string; name: string; email: string | null; image: string | null } | null;
	event?: { id: string; translations: Event['translations'] } | null;
	booking?: { id: string; referenceNumber: number | null; occurrence?: { date: string } | null } | null;
};

export const adminApi = {
	getStats: () => clientApi.get<DashboardStats>('/admin/stats').then((res) => res.data),

	getDashboardFlow: (from: string, to: string) =>
		clientApi
			.get<DashboardFlow>('/admin/stats/flow', { params: { from, to } })
			.then((res) => res.data),

	getDashboardRevenue: (from: string, to: string) =>
		clientApi
			.get<DashboardRevenue>('/admin/stats/revenue', { params: { from, to } })
			.then((res) => res.data),

	getDashboardExpectedTimeline: (from: string, to: string) =>
		clientApi
			.get<DashboardExpectedTimeline>('/admin/stats/revenue/timeline', { params: { from, to } })
			.then((res) => res.data),

	getDashboardSnapshots: (from: string, to: string) =>
		clientApi
			.get<DashboardSnapshot[]>('/admin/stats/snapshots', { params: { from, to } })
			.then((res) => res.data),

	getBookingState: (from: string, to: string) =>
		clientApi
			.get<BookingStatePoint[]>('/admin/stats/booking-state', { params: { from, to } })
			.then((res) => res.data),

	getBookingCohort: (from: string, to: string) =>
		clientApi
			.get<BookingCohort>('/admin/stats/booking-cohort', { params: { from, to } })
			.then((res) => res.data),

	getBookings: (params?: BookingFilters) =>
		clientApi
			.get<PaginatedResponse<BookingWithDetails>>('/admin/bookings', { params })
			.then((res) => res.data),
	getBookingByReference: (ref: number) =>
		clientApi.get<BookingWithDetails>(`/admin/bookings/by-reference/${ref}`).then((res) => res.data),
	getBookingByCheckinToken: (token: string) =>
		clientApi
			.get<BookingWithDetails>(`/admin/bookings/by-checkin-token/${encodeURIComponent(token)}`)
			.then((res) => res.data),
	checkInBooking: (id: string) =>
		clientApi.post<Booking>(`/admin/bookings/${id}/checkin`).then((res) => res.data),
	undoBookingCheckIn: (id: string) =>
		clientApi.delete<Booking>(`/admin/bookings/${id}/checkin`).then((res) => res.data),
	quoteBookingQuantity: (id: string, data: QuantityQuoteRequest) =>
		clientApi.post<QuantityQuote>(`/admin/bookings/${id}/quantity/quote`, data).then((res) => res.data),
	updateBooking: (id: string, data: ChangeQuantityData) =>
		clientApi.patch<BookingQuantityChange>(`/admin/bookings/${id}/quantity`, data).then((res) => res.data),
	cancelBookingByAdmin: (id: string, data: AdminCancelBookingData) =>
		clientApi.post<Booking>(`/admin/bookings/${id}/cancel`, data).then((res) => res.data),
	transferBooking: (id: string, data: TransferBookingData) =>
		clientApi.post<Booking>(`/admin/bookings/${id}/transfer`, data).then((res) => res.data),
	compensateBooking: (id: string, data: CompensateBookingData) =>
		clientApi
			.post<{ compensatedAmount: number; failed: boolean; message: string }>(
				`/admin/bookings/${id}/compensate`,
				data,
			)
			.then((res) => res.data),
	confirmBookingManually: (id: string, data: ConfirmBookingManuallyData) =>
		clientApi.post<Booking>(`/admin/bookings/${id}/confirm`, data).then((res) => res.data),
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
	cancelOccurrence: (occurrenceId: string, reasons?: CancellationReasons) =>
		clientApi
			.patch(`/admin/occurrences/${occurrenceId}/cancel`, { reasons })
			.then((res) => res.data),
	rescheduleOccurrence: (occurrenceId: string, date: string, reasons?: CancellationReasons) =>
		clientApi
			.patch<EventOccurrence>(`/admin/occurrences/${occurrenceId}/reschedule`, { date, reasons })
			.then((res) => res.data),
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
	updateShadowUser: (id: string, data: UpdateShadowUserData) =>
		clientApi.patch<SafeUserData>(`/admin/users/${id}`, data).then((res) => res.data),
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
	getPromoCodeById: (id: string) =>
		clientApi.get<PromoCode>(`/admin/promo-codes/${id}`).then((res) => res.data),
	getPromoCodes: (params?: { skip?: number; limit?: number; search?: string }) =>
		clientApi
			.get<PaginatedResponse<PromoCode>>('/admin/promo-codes', { params })
			.then((res) => res.data),
	createPromoCode: (data: CreatePromoCodeData) =>
		clientApi.post<PromoCode>('/admin/promo-codes', data).then((res) => res.data),
	updatePromoCode: (id: string, data: UpdatePromoCodeData) =>
		clientApi.patch<PromoCode>(`/admin/promo-codes/${id}`, data).then((res) => res.data),
	deletePromoCode: (id: string) =>
		clientApi.delete<{ message: string }>(`/admin/promo-codes/${id}`).then((res) => res.data),
	getBanners: () => clientApi.get<Banner[]>('/banners/admin').then((res) => res.data),
	createBanner: (formData: FormData) =>
		clientApi
			.post<Banner>('/banners', formData, { timeout: EVENT_UPLOAD_TIMEOUTS.CLIENT_MUTATION_MS })
			.then((res) => res.data),
	updateBanner: (id: string, formData: FormData) =>
		clientApi
			.put<Banner>(`/banners/${id}`, formData, {
				timeout: EVENT_UPLOAD_TIMEOUTS.CLIENT_MUTATION_MS,
			})
			.then((res) => res.data),
	reorderBanners: (ids: string[]) =>
		clientApi.patch<Banner[]>('/banners/reorder', { ids }).then((res) => res.data),
	deleteBanner: (id: string) =>
		clientApi.delete<{ message: string }>(`/banners/${id}`).then((res) => res.data),

	getReviews: (params?: { status?: ReviewStatus; cursor?: string; limit?: number }) =>
		clientApi
			.get<PaginatedCursorResponse<AdminReview>>('/admin/reviews', { params })
			.then((res) => res.data),
	getPendingReviewsCount: () =>
		clientApi.get<{ count: number }>('/admin/reviews/pending-count').then((res) => res.data),
	moderateReview: (id: string, data: ModerateReviewData) =>
		clientApi.patch<AdminReview>(`/admin/reviews/${id}/moderate`, data).then((res) => res.data),
	replyToReview: (id: string, data: ReplyToReviewData) =>
		clientApi.patch<AdminReview>(`/admin/reviews/${id}/reply`, data).then((res) => res.data),
	deleteReview: (id: string) =>
		clientApi.delete<{ message: string }>(`/admin/reviews/${id}`).then((res) => res.data),
};
