import {
	averageRating,
	canEditReview,
	initialReviewStatus,
	REVIEW_CONFIG,
	reviewWindow,
} from '@event-space/shared';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const TOUR_START = new Date('2026-10-20T08:00:00.000Z');
const TEN_HOURS = 600;
/** 08:00 + 10 h + 1 h of slack. */
const OPENS_AT = TOUR_START.getTime() + 11 * HOUR;

const booking = (overrides: Record<string, unknown> = {}) => ({
	status: 'CONFIRMED',
	occurrence: { date: TOUR_START, status: 'ACTIVE', event: { duration: TEN_HOURS } },
	...overrides,
});

describe('reviewWindow', () => {
	it('stays shut while the group may still be on the bus', () => {
		expect(reviewWindow(booking(), OPENS_AT - HOUR)).toBe('TOO_EARLY');
	});

	it('counts from the end of the tour, not from its start', () => {
		expect(reviewWindow(booking(), TOUR_START.getTime() + 10 * HOUR + 1)).toBe('TOO_EARLY');
		expect(reviewWindow(booking(), OPENS_AT + 1)).toBe('OPEN');
	});

	it('treats an event with no duration as ending when it starts', () => {
		const noDuration = booking({
			occurrence: { date: TOUR_START, status: 'ACTIVE', event: { duration: null } },
		});

		expect(reviewWindow(noDuration, TOUR_START.getTime() + HOUR + 1)).toBe('OPEN');
	});

	it('closes once the tour is a memory', () => {
		expect(reviewWindow(booking(), OPENS_AT + REVIEW_CONFIG.WINDOW_DAYS * DAY - HOUR)).toBe('OPEN');
		expect(reviewWindow(booking(), OPENS_AT + REVIEW_CONFIG.WINDOW_DAYS * DAY + HOUR)).toBe('CLOSED');
	});

	it('lets nobody through who did not go', () => {
		expect(reviewWindow(booking({ status: 'CANCELLED' }), OPENS_AT + HOUR)).toBe('NOT_ELIGIBLE');
		expect(reviewWindow(booking({ status: 'PENDING' }), OPENS_AT + HOUR)).toBe('NOT_ELIGIBLE');
		expect(reviewWindow(booking({ occurrence: null }), OPENS_AT + HOUR)).toBe('NOT_ELIGIBLE');
	});

	it('says no when the tour itself was called off', () => {
		const cancelled = booking({
			occurrence: { date: TOUR_START, status: 'CANCELLED', event: { duration: TEN_HOURS } },
		});

		expect(reviewWindow(cancelled, OPENS_AT + HOUR)).toBe('NOT_ELIGIBLE');
	});
});

describe('initialReviewStatus', () => {
	it('publishes a bare rating, since a number has nothing to moderate', () => {
		expect(initialReviewStatus(null)).toBe('PUBLISHED');
		expect(initialReviewStatus('   ')).toBe('PUBLISHED');
	});

	it('sends anything written by a person to a person', () => {
		expect(initialReviewStatus('Отличный тур')).toBe('PENDING');
	});
});

describe('canEditReview', () => {
	const written = new Date('2026-10-21T10:00:00.000Z');

	it('allows second thoughts, but not rewriting history', () => {
		expect(canEditReview(written, written.getTime() + 47 * HOUR)).toBe(true);
		expect(canEditReview(written, written.getTime() + 49 * HOUR)).toBe(false);
	});
});

describe('averageRating', () => {
	it('has nothing to show before the first review', () => {
		expect(averageRating({ ratingSum: 0, ratingCount: 0 })).toBeNull();
	});

	it('rounds to one decimal', () => {
		expect(averageRating({ ratingSum: 14, ratingCount: 3 })).toBe(4.7);
		expect(averageRating({ ratingSum: 25, ratingCount: 5 })).toBe(5);
	});
});
