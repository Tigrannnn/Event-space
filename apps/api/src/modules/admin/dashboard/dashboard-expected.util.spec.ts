import {
	addDaysToKey,
	buildExpectedTimeline,
	type ExpectedBooking,
} from './dashboard-expected.util';

const tourDate = new Date('2026-10-20T06:00:00Z');

function booking(overrides: Partial<ExpectedBooking> & Pick<ExpectedBooking, 'adjustments'>) {
	return {
		status: 'CONFIRMED' as const,
		cancelledAt: null,
		tourDate,
		durationMinutes: 480,
		...overrides,
	};
}

function charge(at: string, amount = 100000, feeAmount: number | null = null) {
	return { type: 'CHARGE' as const, amount, feeAmount, createdAt: new Date(at) };
}

function refund(at: string, amount = 100000) {
	return { type: 'REFUND' as const, amount, feeAmount: null, createdAt: new Date(at) };
}

const twoBookings = [
	booking({ adjustments: [charge('2026-10-12T09:00:00Z')] }),
	booking({
		status: 'CANCELLED',
		cancelledAt: new Date('2026-10-15T09:00:00Z'),
		adjustments: [charge('2026-10-12T10:00:00Z'), refund('2026-10-15T09:00:00Z')],
	}),
];

describe('buildExpectedTimeline', () => {
	it('shows what was expected on each past day, not only the current state', () => {
		const now = new Date('2026-10-17T10:00:00Z');
		const timeline = buildExpectedTimeline(twoBookings, '2026-10-10', '2026-10-17', now);
		const byDate = Object.fromEntries(timeline.points.map((point) => [point.date, point]));

		expect(byDate['2026-10-11'].expected).toBe(0);
		expect(byDate['2026-10-12'].expected).toBe(200000);
		expect(byDate['2026-10-14'].expected).toBe(200000);
		expect(byDate['2026-10-15'].expected).toBe(100000);
		expect(timeline.closing).toBe(100000);
	});

	it('balances opening, new money, cancellations and settled money into the closing value', () => {
		const now = new Date('2026-10-22T10:00:00Z');
		const timeline = buildExpectedTimeline(twoBookings, '2026-10-12', '2026-10-22', now);

		expect(timeline.opening).toBe(0);
		expect(timeline.totals).toEqual({ added: 200000, cancelled: 100000, settled: 100000 });
		expect(timeline.closing).toBe(0);
		expect(
			timeline.opening + timeline.totals.added - timeline.totals.cancelled - timeline.totals.settled,
		).toBe(timeline.closing);
	});

	it('moves money out of expected on the day the tour is over', () => {
		const now = new Date('2026-10-22T10:00:00Z');
		const timeline = buildExpectedTimeline(twoBookings, '2026-10-18', '2026-10-22', now);
		const byDate = Object.fromEntries(timeline.points.map((point) => [point.date, point]));

		expect(timeline.opening).toBe(100000);
		expect(byDate['2026-10-19'].expected).toBe(100000);
		expect(byDate['2026-10-20']).toMatchObject({ expected: 0, settled: 100000 });
	});

	it('starts from what was already expected before the period', () => {
		const now = new Date('2026-10-17T10:00:00Z');
		const timeline = buildExpectedTimeline(twoBookings, '2026-10-16', '2026-10-17', now);

		expect(timeline.opening).toBe(100000);
		expect(timeline.totals).toEqual({ added: 0, cancelled: 0, settled: 0 });
	});

	it('does not plot days that have not happened yet', () => {
		const now = new Date('2026-10-14T10:00:00Z');
		const timeline = buildExpectedTimeline(twoBookings, '2026-10-12', '2026-10-31', now);

		expect(timeline.points[timeline.points.length - 1].date).toBe('2026-10-14');
	});

	it('keeps a cancelled booking that got no refund as settled money', () => {
		const kept = booking({
			status: 'CANCELLED',
			cancelledAt: new Date('2026-10-16T09:00:00Z'),
			adjustments: [charge('2026-10-12T09:00:00Z')],
		});
		const now = new Date('2026-10-17T10:00:00Z');
		const timeline = buildExpectedTimeline([kept], '2026-10-10', '2026-10-17', now);
		const byDate = Object.fromEntries(timeline.points.map((point) => [point.date, point]));

		expect(byDate['2026-10-15'].expected).toBe(100000);
		expect(byDate['2026-10-16']).toMatchObject({ expected: 0, settled: 100000 });
	});

	it('ignores corrections made after the tour', () => {
		const corrected = booking({
			adjustments: [charge('2026-10-12T09:00:00Z'), refund('2026-10-25T09:00:00Z', 30000)],
		});
		const now = new Date('2026-10-26T10:00:00Z');
		const timeline = buildExpectedTimeline([corrected], '2026-10-12', '2026-10-26', now);

		expect(timeline.totals.cancelled).toBe(0);
		expect(timeline.closing).toBe(0);
	});

	it('subtracts the payment fee from what is expected', () => {
		const fee = booking({ adjustments: [charge('2026-10-12T09:00:00Z', 100000, 3000)] });
		const now = new Date('2026-10-13T10:00:00Z');
		const timeline = buildExpectedTimeline([fee], '2026-10-12', '2026-10-13', now);

		expect(timeline.closing).toBe(97000);
	});
});

describe('addDaysToKey', () => {
	it('moves across month ends', () => {
		expect(addDaysToKey('2026-10-31', 1)).toBe('2026-11-01');
		expect(addDaysToKey('2026-03-01', -1)).toBe('2026-02-28');
	});
});
