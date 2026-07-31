import clientApi from '@/lib/client.api';
import type {
	Booking,
	CreateBookingData,
	CreateBookingResponse,
	UpdateBookingData,
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

	updateBooking: (id: string, data: UpdateBookingData) =>
		clientApi.patch<Booking>(`/bookings/${id}`, data).then((res) => res.data),
};
