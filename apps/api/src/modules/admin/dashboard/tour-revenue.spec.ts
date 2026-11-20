import { summarizeTourRevenue } from './dashboard-revenue.service';

const NOW = new Date('2026-11-20T10:00:00Z');
const charge = (amount: number, fee = 0) => ({ type: 'CHARGE', amount, feeAmount: fee, createdAt: new Date('2026-11-01') });

function tour(id: string, date: string, bookings: object[]) {
	return { id, date: new Date(date), status: 'ACTIVE', event: { duration: 120 }, bookings } as never;
}

function booking(overrides: object) {
	return {
		status: 'CONFIRMED',
		paymentMethod: 'SITE_PAYMENT',
		amount: 10000,
		quantity: 1,
		checkedInAt: null,
		adjustments: [charge(10000)],
		...overrides,
	};
}

describe('summarizeTourRevenue', () => {
	it('tells for each date what it earned or is expected to bring', () => {
		const past = tour('past', '2026-11-10T08:00:00Z', [
			booking({ quantity: 2, amount: 20000, adjustments: [charge(20000, 600)] }),
			booking({ paymentMethod: 'PAY_ON_ARRIVAL', adjustments: [], checkedInAt: new Date('2026-11-10T08:00:00Z') }),
		]);
		const coming = tour('coming', '2026-11-25T08:00:00Z', [
			booking({}),
			booking({ paymentMethod: 'PAY_ON_ARRIVAL', adjustments: [], amount: 5000 }),
		]);

		expect(summarizeTourRevenue([past, coming] as never, NOW).dates).toEqual([
			{ occurrenceId: 'past', finished: true, earned: 29400, expected: 0, toCollectOnSite: 0 },
			{ occurrenceId: 'coming', finished: false, earned: 0, expected: 10000, toCollectOnSite: 5000 },
		]);
	});
});
