import clientApi from '@/lib/client.api';
import type {
	Booking,
	BookingQuantityChange,
	CreateBookingData,
	CreateBookingResponse,
	ChangeQuantityData,
	QuantityQuote,
	QuantityQuoteRequest,
	BookingWithOccurrence,
	BookingWithEstimate,
} from '@event-space/shared';

export const bookingApi = {
	createBooking: (data: CreateBookingData) =>
		clientApi.post<CreateBookingResponse>('/bookings', data).then((res) => res.data),

	getMyBookings: () => clientApi.get<BookingWithEstimate[]>('/bookings/my').then((res) => res.data),

	getBooking: (id: string) => clientApi.get<Booking>(`/bookings/${id}`).then((res) => res.data),

	cancelBooking: (id: string) =>
		clientApi.patch<Booking>(`/bookings/${id}/cancel`).then((res) => res.data),

	reconcilePayment: (id: string) =>
		clientApi.post<Booking>(`/bookings/${id}/reconcile-payment`).then((res) => res.data),

	quoteQuantity: (id: string, data: QuantityQuoteRequest) =>
		clientApi.post<QuantityQuote>(`/bookings/${id}/quantity/quote`, data).then((res) => res.data),

	changeQuantity: (id: string, data: ChangeQuantityData) =>
		clientApi.patch<BookingQuantityChange>(`/bookings/${id}/quantity`, data).then((res) => res.data),
};
