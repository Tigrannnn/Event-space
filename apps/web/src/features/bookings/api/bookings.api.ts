import clientApi from '@/lib/client.api';
import type {
	Booking,
	CreateBookingData,
	CreateBookingResponse,
	UpdateBookingData,
} from '@event-space/shared';

export const bookingApi = {
	createBooking: (data: CreateBookingData) =>
		clientApi.post<CreateBookingResponse>('/bookings', data).then((res) => res.data),

	getMyBookings: () => clientApi.get<Booking[]>('/bookings/my').then((res) => res.data),

	cancelBooking: (id: string) =>
		clientApi.patch<Booking>(`/bookings/${id}/cancel`).then((res) => res.data),

	updateBooking: (id: string, data: UpdateBookingData) =>
		clientApi.patch<Booking>(`/bookings/${id}`, data).then((res) => res.data),
};
