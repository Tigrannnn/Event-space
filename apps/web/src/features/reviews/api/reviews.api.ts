import clientApi from '@/lib/client.api';
import type {
	CreateReviewData,
	MyReview,
	PaginatedCursorResponse,
	Review,
	UpdateReviewData,
} from '@event-space/shared';

/** `mine` arrives with the first page only: the visitor's own reviews, whatever their state. */
export type ReviewsPage = PaginatedCursorResponse<Review> & {
	mine: Review[];
	/** The booking the visitor may review right now, if any. */
	reviewableBookingId?: string | null;
};

/** Plain JSON for a review without new photos, a form with the JSON in `payload` when there are some. */
function toBody(data: CreateReviewData, files: File[]): CreateReviewData | FormData {
	if (!files.length) return data;

	const form = new FormData();
	form.append('payload', JSON.stringify(data));
	for (const file of files) form.append('files', file);
	return form;
}

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

	create: (bookingId: string, data: CreateReviewData, token?: string, files: File[] = []) =>
		clientApi
			.post<Review>(`/bookings/${bookingId}/review`, toBody(data, files), { params: { t: token } })
			.then((res) => res.data),

	remove: (bookingId: string, token?: string) =>
		clientApi.delete(`/bookings/${bookingId}/review`, { params: { t: token } }).then(() => undefined),

	update: (bookingId: string, data: UpdateReviewData, token?: string, files: File[] = []) =>
		clientApi
			.patch<Review>(`/bookings/${bookingId}/review`, toBody(data, files), {
				params: { t: token },
			})
			.then((res) => res.data),
};
