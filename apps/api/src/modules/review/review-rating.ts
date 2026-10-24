import type { Prisma } from '@prisma/client';
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

/**
 * Moves an event's rating by the difference one review makes.
 *
 * The only place `ratingSum` and `ratingCount` ever change, and always inside the transaction
 * that changes the review itself: `increment` rather than a recount, so two moderators working
 * at the same moment cannot overwrite each other's arithmetic.
 */
export async function applyRatingDelta(
	tx: Prisma.TransactionClient,
	eventId: string,
	before: RatedReview | null,
	after: RatedReview | null,
): Promise<void> {
	const delta = ratingDelta(before, after);

	if (isNoChange(delta)) return;

	await tx.event.update({
		where: { id: eventId },
		data: {
			ratingSum: { increment: delta.sum },
			ratingCount: { increment: delta.count },
		},
	});
}
