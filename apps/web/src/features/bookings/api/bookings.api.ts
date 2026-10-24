import clientApi from '@/lib/client.api';
import type {
	Booking,
	BookingQuantityChange,
	CreateBookingData,
	CreateBookingResponse,
	ChangeQuantityData,
	QuantityPaymentResult,
	QuantityQuote,
	QuantityQuoteRequest,
	StartQuantityPayment,
	BookingWithOccurrence,
	BookingWithEstimate,
	BookingDisplayStatus,
	MyBookingsSummary,
	PaginatedCursorResponse,
} from '@event-space/shared';
import { MY_BOOKINGS_PAGE_SIZE } from '@event-space/shared';

export type MyBookingsPage = PaginatedCursorResponse<BookingWithEstimate>;

export const bookingApi = {
	createBooking: (data: CreateBookingData) =>
		clientApi.post<CreateBookingResponse>('/bookings', data).then((res) => res.data),

	getMyBookings: ({
		cursor,
		limit = MY_BOOKINGS_PAGE_SIZE,
		status,
	}: { cursor?: string; limit?: number; status?: BookingDisplayStatus } = {}) =>
		clientApi
			.get<MyBookingsPage>('/bookings/my', { params: { cursor, limit, status } })
			.then((res) => res.data),

	getMyBookingsSummary: () =>
		clientApi.get<MyBookingsSummary>('/bookings/my/summary').then((res) => res.data),

	getBooking: (id: string) => clientApi.get<Booking>(`/bookings/${id}`).then((res) => res.data),

	cancelBooking: (id: string) =>
		clientApi.patch<Booking>(`/bookings/${id}/cancel`).then((res) => res.data),

	acceptReschedule: (id: string) =>
		clientApi
			.patch<{ accepted: boolean }>(`/bookings/${id}/accept-reschedule`)
			.then((res) => res.data),

	reconcilePayment: (id: string) =>
		clientApi.post<Booking>(`/bookings/${id}/reconcile-payment`).then((res) => res.data),

	quoteQuantity: (id: string, data: QuantityQuoteRequest) =>
		clientApi.post<QuantityQuote>(`/bookings/${id}/quantity/quote`, data).then((res) => res.data),

	startQuantityPayment: (id: string, data: QuantityQuoteRequest) =>
		clientApi.post<StartQuantityPayment>(`/bookings/${id}/quantity/payment`, data).then((res) => res.data),

	reconcileQuantityPayment: (id: string, paymentIntentId: string) =>
		clientApi
			.post<QuantityPaymentResult>(`/bookings/${id}/quantity/payments/${paymentIntentId}/reconcile`)
			.then((res) => res.data),

	changeQuantity: (id: string, data: ChangeQuantityData) =>
		clientApi.patch<BookingQuantityChange>(`/bookings/${id}/quantity`, data).then((res) => res.data),
};
