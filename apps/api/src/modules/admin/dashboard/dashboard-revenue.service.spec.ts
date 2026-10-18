import { DashboardRevenueService, summarizeTours } from './dashboard-revenue.service';
import { endOfDay, startOfDay } from '../../../shared/utils/app-day.util';

const HOUR = 60 * 60 * 1000;
const now = new Date('2026-10-12T08:00:00Z');

type Tour = Parameters<typeof summarizeTours>[0][number];

function tour(date: string, bookings: Tour['bookings'], status = 'ACTIVE'): Tour {
	return { date: new Date(date), status, event: { duration: 480 }, bookings };
}

function confirmed(
	amount: number,
	charged = amount,
	refunded = 0,
	status: 'CONFIRMED' | 'CANCELLED' = 'CONFIRMED',
) {
	const adjustments: Tour['bookings'][number]['adjustments'] = [
		{
			type: 'CHARGE',
			amount: charged,
			feeAmount: null,
			createdAt: new Date(now.getTime() - 100 * HOUR),
		},
	];
	if (refunded > 0) {
		adjustments.push({ type: 'REFUND', amount: refunded, feeAmount: null, createdAt: now });
	}
	return {
		status,
		paymentMethod: 'SITE_PAYMENT' as const,
		amount,
		checkedInAt: null,
		adjustments,
	};
}

describe('summarizeTours', () => {
	const start = startOfDay('2026-10-08');
	const end = endOfDay('2026-10-14');

	const tours = [
		tour('2026-10-09T06:00:00Z', [confirmed(10000), confirmed(15000)]),
		tour('2026-10-10T06:00:00Z', [confirmed(20000)]),
		tour('2026-10-11T06:00:00Z', [confirmed(25000, 25000, 25000, 'CANCELLED')]),
		tour('2026-10-13T06:00:00Z', [confirmed(30000), confirmed(5000)]),
		tour('2026-10-14T06:00:00Z', [confirmed(12000)]),
	];

	const summary = summarizeTours(tours, start, end, now);

	it('splits money into earned (finished tours) and expected (upcoming ones)', () => {
		expect(summary.totals.earned).toBe(45000);
		expect(summary.totals.expected).toBe(47000);
	});

	it('counts finished and upcoming tours with guests', () => {
		expect(summary.totals.toursFinished).toBe(2);
		expect(summary.totals.toursUpcoming).toBe(2);
	});

	it('reports what was returned without turning a day negative', () => {
		expect(summary.totals.refunded).toBe(25000);
		expect(summary.points.every((point) => point.earned >= 0 && point.expected >= 0)).toBe(true);
	});

	it('plots money on the day of the tour, with an entry for every day', () => {
		expect(summary.points).toHaveLength(7);
		const byDate = Object.fromEntries(summary.points.map((point) => [point.date, point]));
		expect(byDate['2026-10-09'].earned).toBe(25000);
		expect(byDate['2026-10-10'].earned).toBe(20000);
		expect(byDate['2026-10-11']).toMatchObject({ earned: 0, expected: 0 });
		expect(byDate['2026-10-13'].expected).toBe(35000);
		expect(byDate['2026-10-14'].expected).toBe(12000);
		expect(byDate['2026-10-12']).toMatchObject({ earned: 0, expected: 0 });
	});
});

describe('DashboardRevenueService', () => {
	it('compares earned money with the period of the same length before it', async () => {
		const prisma = {
			eventOccurrence: {
				findMany: jest.fn(({ where }: { where: { date: { gte: Date } } }) =>
					Promise.resolve(
						where.date.gte.getTime() <= new Date('2026-10-02T00:00:00Z').getTime()
							? [tour('2026-10-02T06:00:00Z', [confirmed(10000)])]
							: [tour('2026-10-09T06:00:00Z', [confirmed(25000)])],
					),
				),
			},
		} as never;

		const service = new DashboardRevenueService(prisma);
		const result = await service.getRevenue('2026-10-08', '2026-10-14', now);

		expect(result.totals.earned).toBe(25000);
		expect(result.previousTotals.earned).toBe(10000);
	});

	it('shows money on upcoming tours even when the period lies in the past', async () => {
		const prisma = {
			eventOccurrence: {
				findMany: jest.fn(({ where }: { where: { date: { gte: Date; lte?: Date } } }) =>
					Promise.resolve(
						where.date.lte
							? []
							: [
									tour('2026-10-20T06:00:00Z', [confirmed(20000), confirmed(10000)]),
									tour('2026-11-20T06:00:00Z', [confirmed(5000)]),
								],
					),
				),
			},
		} as never;

		const service = new DashboardRevenueService(prisma);
		const result = await service.getRevenue('2026-09-01', '2026-09-30', now);

		expect(result.totals.expected).toBe(0);
		expect(result.upcoming).toEqual({ expected: 35000, toCollectOnSite: 0, tours: 2 });
	});

	it('sums only upcoming money for the snapshot', async () => {
		const prisma = {
			eventOccurrence: {
				findMany: () =>
					Promise.resolve([
						tour('2026-10-10T06:00:00Z', [confirmed(20000)]),
						tour('2026-10-13T06:00:00Z', [confirmed(30000)]),
						tour('2026-10-20T06:00:00Z', [confirmed(5000)]),
					]),
			},
		} as never;

		const service = new DashboardRevenueService(prisma);
		await expect(service.getUpcomingExpected(now)).resolves.toBe(35000);
	});
});
