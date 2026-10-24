import type { ReviewStatus } from '@event-space/shared';

export interface RatingContribution {
	sum: number;
	count: number;
}

export interface RatedReview {
	status: ReviewStatus;
	rating: number;
}

/** Only a published review moves an event's rating; pending and rejected ones weigh nothing. */
function weigh(review: RatedReview | null): RatingContribution {
	return review && review.status === 'PUBLISHED'
		? { sum: review.rating, count: 1 }
		: { sum: 0, count: 0 };
}

/**
 * How an event's `ratingSum` and `ratingCount` must move when one review changes.
 *
 * Kept as a difference rather than a recount: the columns are updated with `increment`, so two
 * admins moderating at the same moment cannot overwrite each other's work. Deleting a review is
 * `after = null`, creating one is `before = null`.
 */
export function ratingDelta(
	before: RatedReview | null,
	after: RatedReview | null,
): RatingContribution {
	const from = weigh(before);
	const to = weigh(after);

	return { sum: to.sum - from.sum, count: to.count - from.count };
}

export function isNoChange(delta: RatingContribution): boolean {
	return delta.sum === 0 && delta.count === 0;
}
