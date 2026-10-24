import { estimateStripeFeeInCents } from '@event-space/shared';
import { createBookingService } from '../testing/booking.test-helpers';

const HOUR = 60 * 60 * 1000;

interface Row {
	id: string;
	userId?: string;
	paymentIntentId: string | null;
	amount: number;
	hoursAhead?: number;
	/** Ledger rows for this booking; omitted means no CHARGE was ever recorded. */
	adjustments?: {
		type?: 'CHARGE' | 'REFUND';
		status?: 'SUCCEEDED' | 'PENDING' | 'FAILED';
		amount: number;
		feeAmount: number | null;
		stripePaymentIntentId?: string | null;
	}[];
}

function build(options: {
	rows: Row[];
	rules?: { hoursBeforeEvent: number; refundPercentage: number }[];
}) {
	const rules = options.rules ?? [
		{ hoursBeforeEvent: 72, refundPercentage: 100 },
		{ hoursBeforeEvent: 24, refundPercentage: 50 },
	];

	const stored = options.rows.map((row) => ({
		id: row.id,
		userId: row.userId ?? 'u1',
		occurrenceId: 'o1',
		status: 'CONFIRMED',
		quantity: 1,
		amount: row.amount,
		paymentIntentId: row.paymentIntentId,
		createdAt: new Date(),
		adjustments: (row.adjustments ?? []).map((adjustment) => ({
			type: adjustment.type ?? 'CHARGE',
			status: adjustment.status ?? 'SUCCEEDED',
			amount: adjustment.amount,
			feeAmount: adjustment.feeAmount,
			stripePaymentIntentId:
				adjustment.stripePaymentIntentId === undefined
					? row.paymentIntentId
					: adjustment.stripePaymentIntentId,
			createdAt: new Date(),
		})),
		occurrence: {
			id: 'o1',
			date: new Date(Date.now() + (row.hoursAhead ?? 240) * HOUR),
			event: {
				id: 'e1',
				price: 20000,
				images: [],
				cancellationRules: rules,
				translations: [],
				category: { translations: [] },
				occurrences: [],
			},
		},
		user: { id: 'u1' },
	}));

	const prisma = {
		booking: {
			findMany: () => Promise.resolve(stored),
			findUnique: ({ where }: { where: { id: string } }) =>
				Promise.resolve(stored.find((row) => row.id === where.id) ?? null),
		},
	};

	const service = createBookingService(prisma as never, {} as never, {} as never);
	return { service };
}

describe('reading a client’s bookings', () => {
	const charged = (amount: number, feeAmount: number | null) => [{ amount, feeAmount }];

	it('withholds the fee Stripe really charged, taken from our own ledger', async () => {
		const { service } = build({
			rows: [{ id: 'b1', paymentIntentId: 'pi_1', amount: 20000, adjustments: charged(20000, 900) }],
		});
		const [booking] = (await service.findByUser('u1')).data;

		expect(booking).toMatchObject({
			amount: 20000,
			refundPercentage: 100,
			estimatedStripeFeeInCents: 90000,
			estimatedRefundInCents: 1910000,
		});
	});

	it('applies the partial refund percentage of the rule that matches', async () => {
		const { service } = build({
			rows: [
				{
					id: 'b1',
					paymentIntentId: 'pi_1',
					amount: 20000,
					hoursAhead: 30,
					adjustments: charged(20000, 900),
				},
			],
		});
		const [booking] = (await service.findByUser('u1')).data;

		expect(booking).toMatchObject({ refundPercentage: 50, estimatedRefundInCents: 910000 });
	});

	it('falls back to an estimate while the real fee has not been recorded yet', async () => {
		const { service } = build({
			rows: [{ id: 'b1', paymentIntentId: 'pi_1', amount: 20000, adjustments: charged(20000, null) }],
		});
		const [booking] = (await service.findByUser('u1')).data;
		const estimated = estimateStripeFeeInCents(20000);

		expect(booking.estimatedStripeFeeInCents).toBe(estimated);
		expect(booking.estimatedRefundInCents).toBe(Math.max(0, 2000000 - estimated));
	});

	it('falls back to an estimate for a booking with no ledger at all', async () => {
		const { service } = build({ rows: [{ id: 'b1', paymentIntentId: 'pi_1', amount: 20000 }] });
		const [booking] = (await service.findByUser('u1')).data;

		expect(booking.estimatedStripeFeeInCents).toBe(estimateStripeFeeInCents(20000));
	});

	it('counts the fee of a top-up too, since the whole booking is being refunded', async () => {
		const { service } = build({
			rows: [
				{
					id: 'b1',
					paymentIntentId: 'pi_1',
					amount: 30000,
					adjustments: [
						{ amount: 20000, feeAmount: 900 },
						{ amount: 10000, feeAmount: 450, stripePaymentIntentId: 'pi_2' },
					],
				},
			],
		});
		const [booking] = (await service.findByUser('u1')).data;

		expect(booking.estimatedStripeFeeInCents).toBe(135000);
	});

	it('ignores a charge that never went through', async () => {
		const { service } = build({
			rows: [
				{
					id: 'b1',
					paymentIntentId: 'pi_1',
					amount: 20000,
					adjustments: [{ amount: 20000, feeAmount: 900, status: 'FAILED' }],
				},
			],
		});
		const [booking] = (await service.findByUser('u1')).data;

		expect(booking.estimatedStripeFeeInCents).toBe(estimateStripeFeeInCents(20000));
	});

	it('never lets the estimated refund go below zero', async () => {
		const { service } = build({
			rows: [
				{
					id: 'b1',
					paymentIntentId: 'pi_1',
					amount: 20000,
					hoursAhead: 30,
					adjustments: charged(20000, 50000),
				},
			],
		});
		const [booking] = (await service.findByUser('u1')).data;

		expect(booking.estimatedRefundInCents).toBe(0);
	});

	it('shows zeros for a booking nobody paid for', async () => {
		const { service } = build({ rows: [{ id: 'b1', paymentIntentId: null, amount: 20000 }] });
		const [booking] = (await service.findByUser('u1')).data;

		expect(booking).toMatchObject({
			refundPercentage: 0,
			estimatedStripeFeeInCents: 0,
			estimatedRefundInCents: 0,
		});
	});
});

describe('reading one booking', () => {
	it('returns the booking to its owner', async () => {
		const { service } = build({ rows: [{ id: 'b1', paymentIntentId: 'pi_1', amount: 20000 }] });
		await expect(service.findOneForUser('u1', 'b1')).resolves.toMatchObject({ id: 'b1' });
	});

	it('refuses somebody else’s booking', async () => {
		const { service } = build({
			rows: [{ id: 'b1', userId: 'u2', paymentIntentId: 'pi_1', amount: 20000 }],
		});
		await expect(service.findOneForUser('u1', 'b1')).rejects.toBeDefined();
	});

	it('refuses a booking that does not exist', async () => {
		const { service } = build({ rows: [] });
		await expect(service.findOneForUser('u1', 'nope')).rejects.toBeDefined();
	});
});
