import {
	DISCOUNT_PERCENT_MAX,
	eventPricing,
	normalizeDiscountPercent,
	quoteBooking,
	quoteFromBooking,
} from '@event-space/shared';

const sumLines = (lines: { amount: number }[]): number =>
	lines.reduce((total, line) => total + line.amount, 0);

describe('quoteBooking', () => {
	it('charges the full price when no discount is set', () => {
		const quote = quoteBooking({ price: 10000, discountPercent: null }, { quantity: 2 });

		expect(quote.unitPrice).toBe(10000);
		expect(quote.total).toBe(20000);
		expect(quote.discountPercent).toBe(0);
		expect(quote.lines).toEqual([{ kind: 'BASE', label: 'base', amount: 20000 }]);
	});

	it('takes the percent off every seat', () => {
		const quote = quoteBooking({ price: 10000, discountPercent: 20 }, { quantity: 2 });

		expect(quote.baseUnitPrice).toBe(10000);
		expect(quote.unitPrice).toBe(8000);
		expect(quote.baseTotal).toBe(20000);
		expect(quote.total).toBe(16000);
	});

	it('writes the discount as a negative line next to the full price', () => {
		const quote = quoteBooking({ price: 10000, discountPercent: 20 }, { quantity: 2 });

		expect(quote.lines).toEqual([
			{ kind: 'BASE', label: 'base', amount: 20000 },
			{ kind: 'DISCOUNT', label: 'occurrenceDiscount', amount: -4000 },
		]);
	});

	it('keeps the lines adding up to the total at every price, percent and quantity', () => {
		for (let cents = 1; cents <= 5000; cents += 7) {
			for (let percent = 0; percent <= 100; percent += 3) {
				for (const quantity of [1, 2, 3, 7, 13]) {
					const quote = quoteBooking({ price: cents / 100, discountPercent: percent }, { quantity });

					expect(sumLines(quote.lines)).toBeCloseTo(quote.total, 10);
					expect(quote.unitPrice * quantity).toBeCloseTo(quote.total, 10);
					expect(quote.total).toBeLessThanOrEqual(quote.baseTotal);
				}
			}
		}
	});

	it('rounds the seat price down, in the guest favour', () => {
		const quote = quoteBooking({ price: 333.33, discountPercent: 7 }, { quantity: 1 });

		expect(quote.unitPrice).toBe(309.99);
	});

	it('treats a string price the way Prisma hands a Decimal over', () => {
		const quote = quoteBooking({ price: '10000.00', discountPercent: 10 }, { quantity: 1 });

		expect(quote.total).toBe(9000);
	});

	it('refuses a quantity below one', () => {
		expect(quoteBooking({ price: 10000 }, { quantity: 0 }).total).toBe(10000);
		expect(quoteBooking({ price: 10000 }, { quantity: -5 }).total).toBe(10000);
	});
});

describe('normalizeDiscountPercent', () => {
	it('reads anything below one percent as no discount', () => {
		expect(normalizeDiscountPercent(null)).toBe(0);
		expect(normalizeDiscountPercent(undefined)).toBe(0);
		expect(normalizeDiscountPercent(0)).toBe(0);
		expect(normalizeDiscountPercent(-30)).toBe(0);
		expect(normalizeDiscountPercent(Number.NaN)).toBe(0);
	});

	it('never lets a discount make the tour free', () => {
		expect(normalizeDiscountPercent(100)).toBe(DISCOUNT_PERCENT_MAX);
		expect(normalizeDiscountPercent(1000)).toBe(DISCOUNT_PERCENT_MAX);
	});

	it('drops the fractional part', () => {
		expect(normalizeDiscountPercent(20.9)).toBe(20);
	});
});

describe('quoteFromBooking', () => {
	it('rebuilds the receipt a booking was charged at', () => {
		const quote = quoteFromBooking({
			amount: 16000,
			baseAmount: 20000,
			discountPercent: 20,
			quantity: 2,
		});

		expect(quote.unitPrice).toBe(8000);
		expect(quote.baseUnitPrice).toBe(10000);
		expect(quote.total).toBe(16000);
		expect(quote.lines).toEqual([
			{ kind: 'BASE', label: 'base', amount: 20000 },
			{ kind: 'DISCOUNT', label: 'occurrenceDiscount', amount: -4000 },
		]);
	});

	it('reads a booking taken before discounts existed as a full-price one', () => {
		const quote = quoteFromBooking({ amount: 20000, baseAmount: null, quantity: 2 });

		expect(quote.discountPercent).toBe(0);
		expect(quote.baseTotal).toBe(20000);
		expect(quote.lines).toHaveLength(1);
	});

	it('ignores a frozen percent that does not match the frozen amounts', () => {
		const quote = quoteFromBooking({
			amount: 20000,
			baseAmount: 20000,
			discountPercent: 20,
			quantity: 2,
		});

		expect(quote.discountPercent).toBe(0);
	});
});

describe('eventPricing', () => {
	const future = new Date('2026-12-01T10:00:00.000Z');
	const past = new Date('2026-01-01T10:00:00.000Z');
	const now = new Date('2026-06-01T10:00:00.000Z');

	it('shows the base price when nothing is discounted', () => {
		const pricing = eventPricing(
			{ price: 10000, occurrences: [{ date: future, status: 'ACTIVE' }] },
			now,
		);

		expect(pricing).toEqual({ basePrice: 10000, fromPrice: 10000, maxDiscountPercent: 0 });
	});

	it('shows the cheapest upcoming date and the deepest discount', () => {
		const pricing = eventPricing(
			{
				price: 10000,
				occurrences: [
					{ date: future, status: 'ACTIVE', discountPercent: 10 },
					{ date: future, status: 'ACTIVE', discountPercent: 30 },
					{ date: future, status: 'ACTIVE' },
				],
			},
			now,
		);

		expect(pricing.fromPrice).toBe(7000);
		expect(pricing.maxDiscountPercent).toBe(30);
	});

	it('ignores a discount on a date that is over or cancelled', () => {
		const pricing = eventPricing(
			{
				price: 10000,
				occurrences: [
					{ date: past, status: 'ACTIVE', discountPercent: 50 },
					{ date: future, status: 'CANCELLED', discountPercent: 40 },
					{ date: future, status: 'ACTIVE' },
				],
			},
			now,
		);

		expect(pricing.fromPrice).toBe(10000);
		expect(pricing.maxDiscountPercent).toBe(0);
	});

	it('survives an event with no dates at all', () => {
		expect(eventPricing({ price: 10000 }, now).fromPrice).toBe(10000);
	});
});
