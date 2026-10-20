import { Prisma } from '@prisma/client';
import { chargeTestCard, createLiveApp, seedTour, type LiveApp } from './helpers/live-app';

const cents = (value: Prisma.Decimal | null) => Math.round(Number(value ?? 0) * 100);

describe('changing the number of guests against the real database and Stripe test mode', () => {
	let live: LiveApp;
	let bookingId: string;
	let occurrenceId: string;
	let paymentIntentId: string;
	let feeInCents = 0;

	const rows = () =>
		live.prisma.bookingAdjustment.findMany({ where: { bookingId }, orderBy: { createdAt: 'asc' } });
	const client = () => ({ kind: 'client', userId: live.userId }) as const;

	beforeAll(async () => {
		live = await createLiveApp();
		const occurrence = await seedTour(live.prisma, live.userId, 3);
		occurrenceId = occurrence.id;

		const card = await chargeTestCard(live.stripe, 30000);
		paymentIntentId = card.paymentIntentId;

		const booking = await live.prisma.booking.create({
			data: {
				userId: live.userId,
				occurrenceId,
				status: 'CONFIRMED',
				quantity: 3,
				amount: new Prisma.Decimal(30000),
				paymentMethod: 'SITE_PAYMENT',
				paymentIntentId,
				referenceNumber: 1,
			},
		});
		bookingId = booking.id;

		await live.prisma.bookingAdjustment.create({
			data: {
				bookingId,
				type: 'CHARGE',
				status: 'SUCCEEDED',
				amount: new Prisma.Decimal(30000),
				stripePaymentIntentId: paymentIntentId,
				reason: 'Payment captured',
				feeAmount: new Prisma.Decimal(card.feeInCents / 100),
			},
		});
	}, 60_000);

	afterAll(async () => {
		await live?.close();
	}, 60_000);

	it('shows the refund for one removed guest before anything is changed', async () => {
		const quote = await live.bookings.quoteQuantity(client(), bookingId, { quantity: 2 });

		expect(quote).toMatchObject({ direction: 'DECREASE', unitPriceInCents: 1_000_000 });
		expect(quote.refund?.percentage).toBe(100);
		expect(quote.refund?.grossInCents).toBe(1_000_000);
		expect(await rows()).toHaveLength(1);
	});

	it('removes the first guest: refunds through Stripe and records it next to the payment', async () => {
		const quote = await live.bookings.quoteQuantity(client(), bookingId, { quantity: 2 });
		const expectedRefundInCents = quote.refund?.netInCents as number;

		const result = await live.bookings.changeQuantity(client(), bookingId, {
			quantity: 2,
			expectedRefundInCents,
		});

		expect(result).toMatchObject({ quantity: 2, amount: 20000 });

		const booking = await live.prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
		const occurrence = await live.prisma.eventOccurrence.findUniqueOrThrow({
			where: { id: occurrenceId },
		});
		expect(booking.quantity).toBe(2);
		expect(Number(booking.amount)).toBe(20000);
		expect(occurrence.currentParticipants).toBe(2);

		const [charge, refund] = await rows();
		feeInCents = cents(charge.feeAmount);
		expect(refund).toMatchObject({ type: 'REFUND', status: 'SUCCEEDED' });
		expect(refund.operationKey).toMatch(/^qty:/);
		expect(cents(refund.amount)).toBe(expectedRefundInCents);

		const stripeRefunds = await live.stripe.refunds.list({ payment_intent: paymentIntentId });
		expect(stripeRefunds.data).toHaveLength(1);
		expect(stripeRefunds.data[0].amount).toBe(expectedRefundInCents);
	}, 60_000);

	it('removes the second guest: a second refund of the same payment is accepted', async () => {
		const quote = await live.bookings.quoteQuantity(client(), bookingId, { quantity: 1 });

		await live.bookings.changeQuantity(client(), bookingId, {
			quantity: 1,
			expectedRefundInCents: quote.refund?.netInCents,
		});

		const refunds = (await rows()).filter((row) => row.type === 'REFUND');
		expect(refunds).toHaveLength(2);
		expect(new Set(refunds.map((row) => row.operationKey)).size).toBe(2);

		const stripeRefunds = await live.stripe.refunds.list({ payment_intent: paymentIntentId });
		expect(stripeRefunds.data).toHaveLength(2);
	}, 60_000);

	it('cancels the last guest: the rest is refunded and the fee is held back exactly once in total', async () => {
		await live.bookings.cancel(live.userId, bookingId);

		const refunds = (await rows()).filter((row) => row.type === 'REFUND');
		expect(refunds).toHaveLength(3);
		expect(refunds.every((row) => row.status === 'SUCCEEDED')).toBe(true);

		const refundedInCents = refunds.reduce((sum, row) => sum + cents(row.amount), 0);
		const withheldInCents = refunds.reduce((sum, row) => sum + cents(row.feeWithheld), 0);

		expect(refundedInCents + withheldInCents).toBe(3_000_000);
		expect(withheldInCents).toBe(feeInCents);

		const stripeRefunds = await live.stripe.refunds.list({
			payment_intent: paymentIntentId,
			limit: 10,
		});
		expect(stripeRefunds.data.reduce((sum, refund) => sum + refund.amount, 0)).toBe(refundedInCents);
	}, 60_000);
});
