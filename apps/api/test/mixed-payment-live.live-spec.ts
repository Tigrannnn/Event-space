import { Prisma } from '@prisma/client';
import { chargeTestCard, createLiveApp, seedTour, type LiveApp } from './helpers/live-app';

const cents = (value: Prisma.Decimal | null) => Math.round(Number(value ?? 0) * 100);

describe('a booking paid by card and in cash, against the real database and Stripe test mode', () => {
	let live: LiveApp;
	let occurrenceId: string;

	beforeAll(async () => {
		live = await createLiveApp();
		const occurrence = await seedTour(live.prisma, live.userId, 0);
		occurrenceId = occurrence.id;
	}, 60_000);

	afterAll(async () => {
		await live?.close();
	}, 60_000);

	async function bookFourGuests(reference: number) {
		const guest = await live.prisma.user.create({
			data: { email: `guest${reference}@test.am`, name: 'Guest', emailVerified: true },
		});
		const card = await chargeTestCard(live.stripe, 30000);

		await live.prisma.eventOccurrence.update({
			where: { id: occurrenceId },
			data: { currentParticipants: { increment: 4 } },
		});

		const booking = await live.prisma.booking.create({
			data: {
				userId: guest.id,
				occurrenceId,
				status: 'CONFIRMED',
				quantity: 4,
				amount: new Prisma.Decimal(40000),
				paymentMethod: 'SITE_PAYMENT',
				paymentIntentId: card.paymentIntentId,
				referenceNumber: reference,
			},
		});

		await live.prisma.bookingAdjustment.create({
			data: {
				bookingId: booking.id,
				type: 'CHARGE',
				status: 'SUCCEEDED',
				amount: new Prisma.Decimal(30000),
				stripePaymentIntentId: card.paymentIntentId,
				feeAmount: new Prisma.Decimal(card.feeInCents / 100),
				reason: 'Payment captured',
			},
		});
		await live.prisma.bookingAdjustment.create({
			data: {
				bookingId: booking.id,
				type: 'CHARGE',
				status: 'SUCCEEDED',
				amount: new Prisma.Decimal(10000),
				stripePaymentIntentId: null,
				reason: 'Paid offline, entered by an admin',
			},
		});

		return { bookingId: booking.id, guestId: guest.id, ...card };
	}

	it('cancelling refunds the card part through Stripe and leaves the cash part to be returned', async () => {
		const { bookingId, guestId, paymentIntentId, feeInCents } = await bookFourGuests(10);

		await live.bookings.cancel(guestId, bookingId);

		const rows = await live.prisma.bookingAdjustment.findMany({ where: { bookingId } });
		const cardRefund = rows.find((row) => row.type === 'REFUND' && row.stripePaymentIntentId);
		const cashRefund = rows.find((row) => row.type === 'REFUND' && !row.stripePaymentIntentId);

		expect(cardRefund).toMatchObject({ status: 'SUCCEEDED' });
		expect(cents(cardRefund?.amount ?? null)).toBe(3_000_000 - feeInCents);
		expect(cents(cardRefund?.feeWithheld ?? null)).toBe(feeInCents);
		expect(cashRefund).toMatchObject({ status: 'PENDING' });
		expect(cents(cashRefund?.amount ?? null)).toBe(1_000_000);

		const stripeRefunds = await live.stripe.refunds.list({ payment_intent: paymentIntentId });
		expect(stripeRefunds.data).toHaveLength(1);
		expect(stripeRefunds.data[0].amount).toBe(3_000_000 - feeInCents);
	}, 60_000);

	it('an admin removing two guests refunds the cash first, then cancelling returns the rest of the card', async () => {
		const { bookingId, guestId, paymentIntentId, feeInCents } = await bookFourGuests(11);

		await live.bookings.changeQuantity({ kind: 'admin' }, bookingId, {
			quantity: 2,
			settlement: 'FULL',
		});

		const afterChange = await live.prisma.bookingAdjustment.findMany({
			where: { bookingId, type: 'REFUND' },
		});
		const cash = afterChange.find((row) => !row.stripePaymentIntentId);
		const card = afterChange.find((row) => row.stripePaymentIntentId);
		expect(cents(cash?.amount ?? null)).toBe(1_000_000);
		expect(cash?.status).toBe('SUCCEEDED');
		expect(cents(card?.amount ?? null) + cents(card?.feeWithheld ?? null)).toBe(1_000_000);

		await live.bookings.cancel(guestId, bookingId);

		const refunds = (
			await live.prisma.bookingAdjustment.findMany({ where: { bookingId, type: 'REFUND' } })
		).filter((row) => row.stripePaymentIntentId);
		const refunded = refunds.reduce((sum, row) => sum + cents(row.amount), 0);
		const withheld = refunds.reduce((sum, row) => sum + cents(row.feeWithheld), 0);

		expect(refunded + withheld).toBe(3_000_000);
		expect(withheld).toBe(feeInCents);

		const stripeRefunds = await live.stripe.refunds.list({
			payment_intent: paymentIntentId,
			limit: 10,
		});
		expect(stripeRefunds.data.reduce((sum, refund) => sum + refund.amount, 0)).toBe(refunded);
	}, 90_000);
});
