import { estimateStripeFeeInCents } from '@event-space/shared';
import { createBookingService } from '../testing/booking.test-helpers';

const HOUR = 60 * 60 * 1000;

interface Row {
	id: string;
	userId?: string;
	paymentIntentId: string | null;
	amount: number;
	hoursAhead?: number;
}

function build(options: {
	rows: Row[];
	intentStatus?: string;
	fee?: number | null;
	stripeFails?: boolean;
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

	const stripe = {
		retrievePaymentIntent: () => {
			if (options.stripeFails) return Promise.reject(new Error('stripe down'));
			return Promise.resolve({
				id: 'pi',
				status: options.intentStatus ?? 'succeeded',
				latest_charge: 'ch_1',
			});
		},
		getCharge: () =>
			Promise.resolve({
				balance_transaction: options.fee === null ? null : { fee: options.fee ?? 90000 },
			}),
	};

	const service = createBookingService(prisma as never, stripe as never, {} as never);
	return { service };
}

describe('reading a client’s bookings', () => {
	it('estimates the refund from the rules and the real Stripe fee', async () => {
		const { service } = build({ rows: [{ id: 'b1', paymentIntentId: 'pi_1', amount: 20000 }] });
		const [booking] = await service.findByUser('u1');

		expect(booking).toMatchObject({
			amount: 20000,
			refundPercentage: 100,
			estimatedStripeFeeInCents: 90000,
			estimatedRefundInCents: 1910000,
		});
	});

	it('applies the partial refund percentage of the rule that matches', async () => {
		const { service } = build({
			rows: [{ id: 'b1', paymentIntentId: 'pi_1', amount: 20000, hoursAhead: 30 }],
		});
		const [booking] = await service.findByUser('u1');

		expect(booking).toMatchObject({ refundPercentage: 50, estimatedRefundInCents: 910000 });
	});

	it('falls back to an estimated fee when Stripe cannot be asked', async () => {
		const { service } = build({
			rows: [{ id: 'b1', paymentIntentId: 'pi_1', amount: 20000 }],
			stripeFails: true,
		});
		const [booking] = await service.findByUser('u1');
		const estimated = estimateStripeFeeInCents(20000);

		expect(booking.estimatedStripeFeeInCents).toBe(estimated);
		expect(booking.estimatedRefundInCents).toBe(Math.max(0, 2000000 - estimated));
	});

	it('never lets the estimated refund go below zero', async () => {
		const { service } = build({
			rows: [{ id: 'b1', paymentIntentId: 'pi_1', amount: 20000, hoursAhead: 30 }],
			fee: 5000000,
		});
		const [booking] = await service.findByUser('u1');

		expect(booking.estimatedRefundInCents).toBe(0);
	});

	it('shows zeros for a booking nobody paid for', async () => {
		const { service } = build({ rows: [{ id: 'b1', paymentIntentId: null, amount: 20000 }] });
		const [booking] = await service.findByUser('u1');

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
