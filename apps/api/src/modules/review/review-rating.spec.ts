import { isNoChange, ratingDelta } from './review-rating';

const published = (rating: number) => ({ status: 'PUBLISHED' as const, rating });
const pending = (rating: number) => ({ status: 'PENDING' as const, rating });
const rejected = (rating: number) => ({ status: 'REJECTED' as const, rating });

describe('ratingDelta', () => {
	it('adds a rating the moment it is published', () => {
		expect(ratingDelta(null, published(4))).toEqual({ sum: 4, count: 1 });
	});

	it('ignores a review still waiting to be read', () => {
		expect(ratingDelta(null, pending(1))).toEqual({ sum: 0, count: 0 });
	});

	it('takes a rating back when the review is rejected or deleted', () => {
		expect(ratingDelta(published(5), rejected(5))).toEqual({ sum: -5, count: -1 });
		expect(ratingDelta(published(5), null)).toEqual({ sum: -5, count: -1 });
	});

	it('moves the sum but not the count when an author changes their mind', () => {
		expect(ratingDelta(published(5), published(3))).toEqual({ sum: -2, count: 0 });
	});

	it('withdraws the rating when text is added to a bare one, since it now needs reading', () => {
		expect(ratingDelta(published(4), pending(4))).toEqual({ sum: -4, count: -1 });
	});

	it('counts nothing twice when a pending review is edited', () => {
		expect(isNoChange(ratingDelta(pending(2), pending(5)))).toBe(true);
	});

	it('publishes what the admin approved', () => {
		expect(ratingDelta(pending(4), published(4))).toEqual({ sum: 4, count: 1 });
	});
});
