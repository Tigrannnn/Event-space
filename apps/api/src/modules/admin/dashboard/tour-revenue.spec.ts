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
	it('sums what past dates earned, lists each date and keeps coming dates apart', () => {
		const past = tour('past', '2026-11-10T08:00:00Z', [
			booking({ quantity: 2, amount: 20000, adjustments: [charge(20000, 600)] }),
			booking({ paymentMethod: 'PAY_ON_ARRIVAL', adjustments: [], checkedInAt: new Date('2026-11-10T08:00:00Z') }),
		]);
		const empty = tour('empty', '2026-11-12T08:00:00Z', []);
		const coming = tour('coming', '2026-11-25T08:00:00Z', [
			booking({}),
			booking({ paymentMethod: 'PAY_ON_ARRIVAL', adjustments: [], amount: 5000 }),
		]);

		const result = summarizeTourRevenue([coming, empty, past] as never, [coming] as never, NOW);

		expect(result.earned).toBe(29400);
		expect(result.dates.map((row) => [row.occurrenceId, row.finished, row.guests, row.earned, row.expected])).toEqual([
			['coming', false, 2, 0, 10000],
			['past', true, 3, 29400, 0],
		]);
		expect(result.upcoming).toEqual({ dates: 1, expected: 10000, toCollectOnSite: 5000 });
	});
});
