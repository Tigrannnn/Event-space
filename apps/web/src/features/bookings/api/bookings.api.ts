import clientApi from '@/lib/client.api';
import type {
	Booking,
	BookingQuantityChange,
	CreateBookingData,
	CreateBookingResponse,
	CreateGuestBookingData,
	CreateGuestBookingResponse,
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
	ApplyPromoCodeData,
	PromoCodeQuote,
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

	createGuestBooking: (data: CreateGuestBookingData) =>
		clientApi.post<CreateGuestBookingResponse>('/bookings/guest', data).then((res) => res.data),

	/** `token` is the link from the booking's email: the way in for someone with no account. */
	getBooking: (id: string, token?: string) =>
		clientApi.get<Booking>(`/bookings/${id}`, { params: { t: token } }).then((res) => res.data),

	/** The confirmation letter again, to the booking's own email. */
	resendConfirmation: (id: string, token?: string) =>
		clientApi
			.post<{ sent: boolean }>(`/bookings/${id}/resend-confirmation`, undefined, { params: { t: token } })
			.then((res) => res.data),

	/** One booking in full, with the refund it would get today. */
	getBookingView: (id: string, token?: string) =>
		clientApi
			.get<BookingWithEstimate>(`/bookings/${id}/view`, { params: { t: token } })
			.then((res) => res.data),

	cancelBooking: (id: string, token?: string) =>
		clientApi
			.patch<Booking>(`/bookings/${id}/cancel`, undefined, { params: { t: token } })
			.then((res) => res.data),

	acceptReschedule: (id: string, token?: string) =>
		clientApi
			.patch<{ accepted: boolean }>(`/bookings/${id}/accept-reschedule`, undefined, {
				params: { t: token },
			})
			.then((res) => res.data),

	reconcilePayment: (id: string, token?: string) =>
		clientApi
			.post<Booking>(`/bookings/${id}/reconcile-payment`, undefined, { params: { t: token } })
			.then((res) => res.data),

	quoteQuantity: (id: string, data: QuantityQuoteRequest, token?: string) =>
		clientApi
			.post<QuantityQuote>(`/bookings/${id}/quantity/quote`, data, { params: { t: token } })
			.then((res) => res.data),

	startQuantityPayment: (id: string, data: QuantityQuoteRequest, token?: string) =>
		clientApi
			.post<StartQuantityPayment>(`/bookings/${id}/quantity/payment`, data, { params: { t: token } })
			.then((res) => res.data),

	reconcileQuantityPayment: (id: string, paymentIntentId: string, token?: string) =>
		clientApi
			.post<QuantityPaymentResult>(
				`/bookings/${id}/quantity/payments/${paymentIntentId}/reconcile`,
				undefined,
				{ params: { t: token } },
			)
			.then((res) => res.data),

	changeQuantity: (id: string, data: ChangeQuantityData, token?: string) =>
		clientApi
			.patch<BookingQuantityChange>(`/bookings/${id}/quantity`, data, { params: { t: token } })
			.then((res) => res.data),

	validatePromoCode: (data: ApplyPromoCodeData) =>
		clientApi.post<PromoCodeQuote>('/promo-codes/validate', data).then((res) => res.data),
};
