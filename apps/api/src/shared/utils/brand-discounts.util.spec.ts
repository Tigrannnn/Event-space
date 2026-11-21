import { dateDiscountsEnabled, effectiveDateDiscount, stripDateDiscounts } from './brand-discounts.util';

describe('brand date discounts', () => {
	it('is on for brands without the module switched off', () => {
		expect(dateDiscountsEnabled('syuniktour.event-space.space')).toBe(true);
		expect(dateDiscountsEnabled(undefined)).toBe(true);
		expect(effectiveDateDiscount(20, 'syuniktour.event-space.space')).toBe(20);
	});

	it('is off for yerivar', () => {
		expect(dateDiscountsEnabled('yerivar.event-space.space')).toBe(false);
		expect(effectiveDateDiscount(20, 'yerivar.event-space.space')).toBeNull();
	});

	it('clears the discount on occurrences nested anywhere, and only there', () => {
		const body = {
			items: [
				{
					id: 'e1',
					price: 25000,
					occurrences: [
						{ id: 'o1', discountPercent: 20, maxParticipants: 15, date: new Date() },
						{ id: 'o2', discountPercent: null, maxParticipants: 15 },
					],
				},
			],
			booking: { id: 'b1', discountPercent: 20, amount: 20000 },
		};

		stripDateDiscounts(body);

		expect(body.items[0].occurrences.map((o) => o.discountPercent)).toEqual([null, null]);
		expect(body.booking.discountPercent).toBe(20);
		expect(body.items[0].occurrences[0].date).toBeInstanceOf(Date);
	});
});
