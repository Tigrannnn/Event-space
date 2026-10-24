import clientApi from '@/lib/client.api';
import type {
	CreateReviewData,
	MyReview,
	PaginatedCursorResponse,
	Review,
	UpdateReviewData,
} from '@event-space/shared';

export type ReviewsPage = PaginatedCursorResponse<Review>;

export const reviewsApi = {
	getForEvent: (eventId: string, params: { cursor?: string; limit?: number } = {}) =>
		clientApi
			.get<ReviewsPage>(`/events/${eventId}/reviews`, { params })
			.then((res) => res.data),

	/** `token` is the signed link from the invitation email — the way in for a guest. */
	getMine: (bookingId: string, token?: string) =>
		clientApi
			.get<MyReview>(`/bookings/${bookingId}/review`, { params: { t: token } })
			.then((res) => res.data),

	create: (bookingId: string, data: CreateReviewData, token?: string) =>
		clientApi
			.post<Review>(`/bookings/${bookingId}/review`, data, { params: { t: token } })
			.then((res) => res.data),

	update: (bookingId: string, data: UpdateReviewData, token?: string) =>
		clientApi
			.patch<Review>(`/bookings/${bookingId}/review`, data, { params: { t: token } })
			.then((res) => res.data),
};
