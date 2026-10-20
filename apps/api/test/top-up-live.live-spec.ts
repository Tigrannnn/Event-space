import { Prisma } from '@prisma/client';
import {
	chargeTestCard,
	createLiveApp,
	payIntent,
	seedTour,
	type LiveApp,
} from './helpers/live-app';

const cents = (value: Prisma.Decimal | null) => Math.round(Number(value ?? 0) * 100);

describe('paying for more guests, against the real database and Stripe test mode', () => {
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

	async function bookTwoGuests(reference: number) {
		const guest = await live.prisma.user.create({
			data: { email: `topup${reference}@test.am`, name: 'Guest', emailVerified: true },
		});
		const card = await chargeTestCard(live.stripe, 20000);

		await live.prisma.eventOccurrence.update({
			where: { id: occurrenceId },
			data: { currentParticipants: { increment: 2 } },
		});

		const booking = await live.prisma.booking.create({
			data: {
				userId: guest.id,
				occurrenceId,
				status: 'CONFIRMED',
				quantity: 2,
				amount: new Prisma.Decimal(20000),
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
				amount: new Prisma.Decimal(20000),
				stripePaymentIntentId: card.paymentIntentId,
				feeAmount: new Prisma.Decimal(card.feeInCents / 100),
				reason: 'Payment captured',
			},
		});

		return { bookingId: booking.id, guestId: guest.id, firstIntent: card.paymentIntentId };
	}

	async function startPayment(guestId: string, bookingId: string, quantity: number) {
		const started = await live.bookings.startQuantityPayment(guestId, bookingId, { quantity });
		const modification = await live.prisma.bookingModification.findUniqueOrThrow({
			where: { id: started.modificationId },
		});

		return { started, intentId: modification.paymentIntentId as string };
	}

	it('adds the guests once the card payment for the difference goes through', async () => {
		const { bookingId, guestId } = await bookTwoGuests(20);
		const { started, intentId } = await startPayment(guestId, bookingId, 5);

		expect(started.quote).toMatchObject({ direction: 'INCREASE', dueInCents: 3_000_000 });
		expect(started.clientSecret).toContain('_secret_');

		const before = await live.prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
		expect(before.quantity).toBe(2);

		await payIntent(live.stripe, intentId);
		const result = await live.bookings.reconcileQuantityPayment(
			guestId,
			bookingId,
			started.modificationId,
		);
		expect(result.status).toBe('APPLIED');

		const after = await live.prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
		expect(after.quantity).toBe(5);
		expect(Number(after.amount)).toBe(50000);

		const charges = await live.prisma.bookingAdjustment.findMany({
			where: { bookingId, type: 'CHARGE' },
			orderBy: { createdAt: 'asc' },
		});
		expect(charges).toHaveLength(2);
		expect(charges[1]).toMatchObject({ stripePaymentIntentId: intentId, status: 'SUCCEEDED' });
		expect(cents(charges[1].amount)).toBe(3_000_000);

		const again = await live.bookings.reconcileQuantityPayment(
			guestId,
			bookingId,
			started.modificationId,
		);
		expect(again.status).toBe('APPLIED');
		expect(await live.prisma.bookingAdjustment.count({ where: { bookingId, type: 'CHARGE' } })).toBe(
			2,
		);
	}, 90_000);

	it('cancelling a booking paid in two card payments refunds both, holding back each fee once', async () => {
		const { bookingId, guestId, firstIntent } = await bookTwoGuests(21);
		const { started, intentId } = await startPayment(guestId, bookingId, 4);
		const secondFee = await payIntent(live.stripe, intentId);
		await live.bookings.reconcileQuantityPayment(guestId, bookingId, started.modificationId);

		await live.bookings.cancel(guestId, bookingId);

		const refunds = await live.prisma.bookingAdjustment.findMany({
			where: { bookingId, type: 'REFUND' },
		});
		expect(refunds.every((row) => row.status === 'SUCCEEDED')).toBe(true);

		const sum = (intent: string, field: 'amount' | 'feeWithheld') =>
			refunds
				.filter((row) => row.stripePaymentIntentId === intent)
				.reduce((total, row) => total + cents(row[field]), 0);

		expect(sum(firstIntent, 'amount') + sum(firstIntent, 'feeWithheld')).toBe(2_000_000);
		expect(sum(intentId, 'amount') + sum(intentId, 'feeWithheld')).toBe(2_000_000);
		expect(sum(intentId, 'feeWithheld')).toBe(secondFee);

		for (const intent of [firstIntent, intentId]) {
			const stripeRefunds = await live.stripe.refunds.list({ payment_intent: intent });
			expect(stripeRefunds.data.reduce((total, refund) => total + refund.amount, 0)).toBe(
				sum(intent, 'amount'),
			);
		}
	}, 120_000);

	it('refunds the whole payment when the spots were taken while the client paid', async () => {
		const { bookingId, guestId } = await bookTwoGuests(22);
		const { started, intentId } = await startPayment(guestId, bookingId, 4);

		await live.prisma.eventOccurrence.update({
			where: { id: occurrenceId },
			data: { currentParticipants: 10 },
		});

		await payIntent(live.stripe, intentId);
		const result = await live.bookings.reconcileQuantityPayment(
			guestId,
			bookingId,
			started.modificationId,
		);
		expect(result.status).toBe('FAILED');

		const booking = await live.prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
		expect(booking.quantity).toBe(2);

		const refund = await live.prisma.bookingAdjustment.findFirstOrThrow({
			where: { bookingId, type: 'REFUND', stripePaymentIntentId: intentId },
		});
		expect(refund.status).toBe('SUCCEEDED');
		expect(cents(refund.amount)).toBe(2_000_000);

		const stripeRefunds = await live.stripe.refunds.list({ payment_intent: intentId });
		expect(stripeRefunds.data).toHaveLength(1);
		expect(stripeRefunds.data[0].amount).toBe(2_000_000);
	}, 90_000);

	it('the Stripe webhook path adds the guests too', async () => {
		const { bookingId, guestId } = await bookTwoGuests(23);
		await live.prisma.eventOccurrence.update({
			where: { id: occurrenceId },
			data: { currentParticipants: 3 },
		});
		const { intentId } = await startPayment(guestId, bookingId, 3);

		await payIntent(live.stripe, intentId);
		await live.bookings.reconcilePayment(intentId, bookingId);

		const booking = await live.prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
		expect(booking.quantity).toBe(3);
	}, 90_000);
});
