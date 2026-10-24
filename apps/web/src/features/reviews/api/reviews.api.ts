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

	getMine: (bookingId: string) =>
		clientApi.get<MyReview>(`/bookings/${bookingId}/review`).then((res) => res.data),

	create: (bookingId: string, data: CreateReviewData) =>
		clientApi.post<Review>(`/bookings/${bookingId}/review`, data).then((res) => res.data),

	update: (reviewId: string, data: UpdateReviewData) =>
		clientApi.patch<Review>(`/reviews/${reviewId}`, data).then((res) => res.data),
};
