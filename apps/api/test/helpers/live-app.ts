import { Test } from '@nestjs/testing';
import Stripe from 'stripe';
import { Prisma } from '@prisma/client';
import { AppModule } from '@src/app.module';
import { PrismaService } from '@infra/prisma/prisma.service';
import { MailService } from '@infra/mail/mail.service';
import { BookingService } from '@modules/booking/booking.service';
import { flushTestRedis } from './flush-redis';
import { resetDatabase } from './reset-db';

const mailStub = new Proxy(
	{},
	{ get: (_target, key) => (key === 'then' ? undefined : () => Promise.resolve(true)) },
);

export interface LiveApp {
	prisma: PrismaService;
	bookings: BookingService;
	stripe: Stripe;
	userId: string;
	close: () => Promise<void>;
}

export async function createLiveApp(): Promise<LiveApp> {
	await flushTestRedis();

	const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
		.overrideProvider(MailService)
		.useValue(mailStub)
		.compile();

	const app = moduleRef.createNestApplication();
	const prisma = moduleRef.get(PrismaService);
	await resetDatabase(prisma);
	await app.init();

	const user = await prisma.user.create({
		data: { email: 'live@test.am', name: 'Live Tester', emailVerified: true },
	});

	return {
		prisma,
		bookings: moduleRef.get(BookingService),
		stripe: new Stripe(process.env.STRIPE_SECRET_KEY as string),
		userId: user.id,
		close: async () => {
			await resetDatabase(prisma);
			await prisma.category.deleteMany({ where: { slug: 'live-test' } });
			await app.close();
			await flushTestRedis();
		},
	};
}

export async function seedTour(prisma: PrismaService, userId: string, participants: number) {
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

	return prisma.eventOccurrence.create({
		data: {
			eventId: event.id,
			date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
			maxParticipants: 10,
			currentParticipants: participants,
		},
	});
}

export async function chargeTestCard(stripe: Stripe, amountInAmd: number) {
	const intent = await stripe.paymentIntents.create({
		amount: amountInAmd * 100,
		currency: 'amd',
		payment_method: 'pm_card_visa',
		confirm: true,
		automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
	});

	for (let attempt = 0; attempt < 20; attempt += 1) {
		const charge = await stripe.charges.retrieve(intent.latest_charge as string, {
			expand: ['balance_transaction'],
		});
		const balance = charge.balance_transaction;
		if (balance && typeof balance === 'object') {
			return { paymentIntentId: intent.id, feeInCents: balance.fee };
		}
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	throw new Error('Stripe did not report the fee in time');
}

export async function payIntent(stripe: Stripe, paymentIntentId: string) {
	const intent = await stripe.paymentIntents.confirm(paymentIntentId, {
		payment_method: 'pm_card_visa',
		return_url: 'https://example.com/return',
	});

	if (intent.status !== 'succeeded') {
		throw new Error(`The test payment did not succeed: ${intent.status}`);
	}

	for (let attempt = 0; attempt < 20; attempt += 1) {
		const charge = await stripe.charges.retrieve(intent.latest_charge as string, {
			expand: ['balance_transaction'],
		});
		const balance = charge.balance_transaction;
		if (balance && typeof balance === 'object') return balance.fee;
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	throw new Error('Stripe did not report the fee in time');
}
