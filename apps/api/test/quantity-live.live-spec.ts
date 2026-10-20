import { Test } from '@nestjs/testing';
import Stripe from 'stripe';
import { Prisma } from '@prisma/client';
import { AppModule } from '@src/app.module';
import { PrismaService } from '@infra/prisma/prisma.service';
import { MailService } from '@infra/mail/mail.service';
import { BookingService } from '@modules/booking/booking.service';
import { resetDatabase } from './helpers/reset-db';
import { flushTestRedis } from './helpers/flush-redis';

const mailStub = new Proxy(
	{},
	{ get: (_target, key) => (key === 'then' ? undefined : () => Promise.resolve(true)) },
);

describe('changing the number of guests against the real database and Stripe test mode', () => {
	let prisma: PrismaService;
	let bookings: BookingService;
	let stripe: Stripe;
	let closeApp: () => Promise<void>;

	let userId: string;
	let bookingId: string;
	let occurrenceId: string;
	let paymentIntentId: string;
	let feeInCents = 0;

	const rows = () =>
		prisma.bookingAdjustment.findMany({ where: { bookingId }, orderBy: { createdAt: 'asc' } });
	const cents = (value: Prisma.Decimal | null) => Math.round(Number(value ?? 0) * 100);

	beforeAll(async () => {
		await flushTestRedis();

		const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
			.overrideProvider(MailService)
			.useValue(mailStub)
			.compile();

		const app = moduleRef.createNestApplication();
		prisma = moduleRef.get(PrismaService);
		bookings = moduleRef.get(BookingService);
		await resetDatabase(prisma);
		await app.init();

		stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
		closeApp = async () => {
			await resetDatabase(prisma);
			await prisma.category.deleteMany({ where: { slug: 'live-test' } });
			await app.close();
			await flushTestRedis();
		};

		const user = await prisma.user.create({
			data: { email: 'live@test.am', name: 'Live Tester', emailVerified: true },
		});
		userId = user.id;

		const category = await prisma.category.upsert({
			where: { slug: 'live-test' },
			update: {},
			create: { slug: 'live-test' },
		});
		const event = await prisma.event.create({
			data: {
				locationUrl: 'https://maps.example/loc',
				meetingLocationUrl: 'https://maps.example/meet',
				difficulty: 'EASY',
				price: new Prisma.Decimal(10000),
				duration: 180,
				status: 'PUBLISHED',
				userId,
				categoryId: category.id,
				cancellationRules: {
					create: [
						{ hoursBeforeEvent: 72, refundPercentage: 100 },
						{ hoursBeforeEvent: 24, refundPercentage: 50 },
					],
				},
			},
		});
		const occurrence = await prisma.eventOccurrence.create({
			data: {
				eventId: event.id,
				date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
				maxParticipants: 10,
				currentParticipants: 3,
			},
		});
		occurrenceId = occurrence.id;

		const intent = await stripe.paymentIntents.create({
			amount: 3_000_000,
			currency: 'amd',
			payment_method: 'pm_card_visa',
			confirm: true,
			automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
		});
		paymentIntentId = intent.id;
		expect(intent.status).toBe('succeeded');

		const booking = await prisma.booking.create({
			data: {
				userId,
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

		const stripeFeeInCents = await waitForStripeFee(intent.latest_charge as string);
		await prisma.bookingAdjustment.create({
			data: {
				bookingId,
				type: 'CHARGE',
				status: 'SUCCEEDED',
				amount: new Prisma.Decimal(30000),
				stripePaymentIntentId: paymentIntentId,
				reason: 'Payment captured',
				feeAmount: new Prisma.Decimal(stripeFeeInCents / 100),
			},
		});
	}, 60_000);

	afterAll(async () => {
		await closeApp?.();
	}, 60_000);

	it('shows the refund for one removed guest before anything is changed', async () => {
		const quote = await bookings.quoteQuantity({ kind: 'client', userId }, bookingId, {
			quantity: 2,
		});

		expect(quote).toMatchObject({ direction: 'DECREASE', unitPriceInCents: 1_000_000 });
		expect(quote.refund?.percentage).toBe(100);
		expect(quote.refund?.grossInCents).toBe(1_000_000);
		expect(await rowsCount()).toBe(1);
	});

	it('removes the first guest: refunds through Stripe and records it next to the payment', async () => {
		const quote = await bookings.quoteQuantity({ kind: 'client', userId }, bookingId, {
			quantity: 2,
		});
		const expectedRefundInCents = quote.refund?.netInCents as number;

		const result = await bookings.changeQuantity({ kind: 'client', userId }, bookingId, {
			quantity: 2,
			expectedRefundInCents,
		});

		expect(result).toMatchObject({ quantity: 2, amount: 20000 });

		const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
		const occurrence = await prisma.eventOccurrence.findUniqueOrThrow({
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

		const stripeRefunds = await stripe.refunds.list({ payment_intent: paymentIntentId });
		expect(stripeRefunds.data).toHaveLength(1);
		expect(stripeRefunds.data[0].amount).toBe(expectedRefundInCents);
		expect(feeInCents).toBeGreaterThanOrEqual(0);
	}, 60_000);

	it('removes the second guest: a second refund of the same payment is accepted', async () => {
		const quote = await bookings.quoteQuantity({ kind: 'client', userId }, bookingId, {
			quantity: 1,
		});

		await bookings.changeQuantity({ kind: 'client', userId }, bookingId, {
			quantity: 1,
			expectedRefundInCents: quote.refund?.netInCents,
		});

		const refunds = (await rows()).filter((row) => row.type === 'REFUND');
		expect(refunds).toHaveLength(2);
		expect(new Set(refunds.map((row) => row.operationKey)).size).toBe(2);

		const stripeRefunds = await stripe.refunds.list({ payment_intent: paymentIntentId });
		expect(stripeRefunds.data).toHaveLength(2);
	}, 60_000);

	it('cancels the last guest: the rest is refunded and the fee is held back exactly once in total', async () => {
		await bookings.cancel(userId, bookingId);

		const all = await rows();
		const refunds = all.filter((row) => row.type === 'REFUND');
		expect(refunds).toHaveLength(3);
		expect(refunds.every((row) => row.status === 'SUCCEEDED')).toBe(true);

		const refundedInCents = refunds.reduce((sum, row) => sum + cents(row.amount), 0);
		const withheldInCents = refunds.reduce((sum, row) => sum + cents(row.feeWithheld), 0);

		expect(refundedInCents + withheldInCents).toBe(3_000_000);
		expect(withheldInCents).toBe(feeInCents);

		const stripeRefunds = await stripe.refunds.list({ payment_intent: paymentIntentId, limit: 10 });
		const stripeTotal = stripeRefunds.data.reduce((sum, refund) => sum + refund.amount, 0);
		expect(stripeTotal).toBe(refundedInCents);
	}, 60_000);

	async function waitForStripeFee(chargeId: string): Promise<number> {
		for (let attempt = 0; attempt < 20; attempt += 1) {
			const charge = await stripe.charges.retrieve(chargeId, { expand: ['balance_transaction'] });
			const balance = charge.balance_transaction;
			if (balance && typeof balance === 'object') return balance.fee;
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
		throw new Error('Stripe did not report the fee in time');
	}

	async function rowsCount() {
		return (await rows()).length;
	}
});
