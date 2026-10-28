import { REVIEW_CONFIG } from '../constants/review.constant';

export type ReviewWindow = 'OPEN' | 'TOO_EARLY' | 'CLOSED' | 'NOT_ELIGIBLE';

export interface ReviewableBooking {
	status: string;
	occurrence?: {
		date: Date | string;
		status?: string;
		event?: { duration?: number | null } | null;
	} | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

/**
 * When a tour is over, as far as reviews are concerned.
 *
 * The date is the start, so the end has to be worked out from the event's duration; the extra
 * hour is slack for a tour that ran late.
 */
export function reviewOpensAt(date: Date | string, durationMinutes?: number | null): number {
	return (
		new Date(date).getTime() +
		(durationMinutes ?? 0) * MINUTE_MS +
		REVIEW_CONFIG.OPENS_AFTER_END_MS
	);
}

/**
 * Whether this booking may be reviewed right now, and if not, why.
 *
 * Four answers rather than a boolean: "not yet" and "too late" are different things to say to
 * someone, and a cancelled booking is a third. The web app shows a countdown for one, nothing
 * for the others.
 */
export function reviewWindow(booking: ReviewableBooking, now: number = Date.now()): ReviewWindow {
	const occurrence = booking.occurrence;

	if (booking.status !== 'CONFIRMED' || !occurrence || occurrence.status === 'CANCELLED') {
		return 'NOT_ELIGIBLE';
	}

	const opensAt = reviewOpensAt(occurrence.date, occurrence.event?.duration);

	if (now < opensAt) return 'TOO_EARLY';
	if (now > opensAt + REVIEW_CONFIG.WINDOW_DAYS * DAY_MS) return 'CLOSED';

	return 'OPEN';
}

/** A review with text goes to a human; a bare rating has nothing to moderate. */
export function initialReviewStatus(text?: string | null): 'PENDING' | 'PUBLISHED' {
	return text?.trim() ? 'PENDING' : 'PUBLISHED';
}

/** The average as the page shows it: one decimal, and nothing at all before the first review. */
export function averageRating(event: {
	ratingSum?: number | null;
	ratingCount?: number | null;
}): number | null {
	const count = event.ratingCount ?? 0;

	return count > 0 ? Math.round(((event.ratingSum ?? 0) / count) * 10) / 10 : null;
}
