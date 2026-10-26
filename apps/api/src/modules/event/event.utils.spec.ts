import { eventMatchesPrice } from './event.utils';

const HOUR = 60 * 60 * 1000;

function occurrence(hoursFromNow: number, discountPercent: number | null = null, status = 'ACTIVE') {
	return {
		date: new Date(Date.now() + hoursFromNow * HOUR),
		status: status as 'ACTIVE',
		discountPercent,
	};
}

describe('eventMatchesPrice', () => {
	it('matches on the discounted price, not the listed one', () => {
		// 20 000 listed, 40% off one date -> 12 000 actually charged.
		const event = { price: 20000, occurrences: [occurrence(48, 40)] };

		expect(eventMatchesPrice(event, undefined, 15000)).toBe(true);
		expect(eventMatchesPrice(event, undefined, 10000)).toBe(false);
	});

	it('passes everything when no bound is given', () => {
		const event = { price: 20000, occurrences: [occurrence(48)] };
		expect(eventMatchesPrice(event)).toBe(true);
	});

	it('is enough for one date to qualify, even if others do not', () => {
		const event = {
			price: 20000,
			occurrences: [occurrence(24, null), occurrence(48, 50)],
		};

		expect(eventMatchesPrice(event, undefined, 11000)).toBe(true);
	});

	it('ignores past, cancelled and out-of-window dates', () => {
		const event = {
			price: 20000,
			occurrences: [
				occurrence(-24, 90), // in the past — would be 2 000, but doesn't count
				occurrence(48, 90, 'CANCELLED'),
			],
		};

		expect(eventMatchesPrice(event, undefined, 5000)).toBe(false);
	});

	it('respects minPrice too', () => {
		const event = { price: 20000, occurrences: [occurrence(48, 40)] }; // 12 000
		expect(eventMatchesPrice(event, 13000)).toBe(false);
		expect(eventMatchesPrice(event, 10000)).toBe(true);
	});
});
