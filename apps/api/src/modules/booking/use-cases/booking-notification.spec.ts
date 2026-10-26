import { BookingNotificationService } from './booking-notification.service';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

interface StoredBooking {
	id: string;
	status: 'CONFIRMED' | 'PENDING';
	confirmationSentAt: Date | null;
	updatedAt: Date;
	email: string | null;
}

function build(stored: StoredBooking[], mailResults: (boolean | Error)[] = []) {
	const sent: string[] = [];
	const results = [...mailResults];

	const record = (booking: StoredBooking) => ({
		id: booking.id,
		status: booking.status,
		referenceNumber: 42,
		quantity: 1,
		amount: 20000,
		paymentMethod: 'SITE_PAYMENT',
		brandHost: null,
		createdAt: new Date(),
		user: { email: booking.email, name: 'Ани', locale: 'ru' },
		occurrence: {
			date: new Date(),
			event: {
				duration: 480,
				meetingLocationUrl: '',
				translations: [{ locale: 'ru', title: 'Татев', whatsIncluded: [] }],
				cancellationRules: [],
			},
		},
	});

	const prisma = {
		booking: {
			findUnique: ({ where }: { where: { id: string } }) => {
				const found = stored.find((booking) => booking.id === where.id);
				return Promise.resolve(found ? record(found) : null);
			},
			updateMany: ({
				where,
				data,
			}: {
				where: { id: string; confirmationSentAt?: null };
				data: { confirmationSentAt: Date | null };
			}) => {
				const matched = stored.filter(
					(booking) =>
						booking.id === where.id &&
						(where.confirmationSentAt === undefined || booking.confirmationSentAt === null),
				);
				matched.forEach((booking) => (booking.confirmationSentAt = data.confirmationSentAt));
				return Promise.resolve({ count: matched.length });
			},
			findMany: ({ where }: { where: { updatedAt: { gte: Date; lte: Date } } }) =>
				Promise.resolve(
					stored
						.filter(
							(booking) =>
								booking.status === 'CONFIRMED' &&
								booking.confirmationSentAt === null &&
								booking.email !== null &&
								booking.updatedAt >= where.updatedAt.gte &&
								booking.updatedAt <= where.updatedAt.lte,
						)
						.map((booking) => ({ id: booking.id })),
				),
		},
	};

	const mail = {
		sendBookingConfirmation: (payload: { to: string }) => {
			const next = results.length > 0 ? results.shift()! : true;
			if (next instanceof Error) return Promise.reject(next);
			if (next) sent.push(payload.to);
			return Promise.resolve(next);
		},
	};

	const config = { get: () => undefined, getOrThrow: () => 'test-secret' };
	const service = new BookingNotificationService(prisma as never, mail as never, config as never);
	return { service, sent };
}

const booking = (over: Partial<StoredBooking> = {}): StoredBooking => ({
	id: 'b1',
	status: 'CONFIRMED',
	confirmationSentAt: null,
	updatedAt: new Date(Date.now() - 30 * MINUTE),
	email: 'a@x.am',
	...over,
});

describe('booking confirmation email', () => {
	it('is sent once and the mark stays', async () => {
		const stored = [booking()];
		const { service, sent } = build(stored);

		await service.sendConfirmation('b1', 'ru');
		await service.sendConfirmation('b1', 'ru');

		expect(sent).toEqual(['a@x.am']);
		expect(stored[0].confirmationSentAt).not.toBeNull();
	});

	it('gives the mark back when the mail service reports that it did not go out', async () => {
		const stored = [booking()];
		const { service, sent } = build(stored, [false]);

		await service.sendConfirmation('b1', 'ru');

		expect(sent).toHaveLength(0);
		expect(stored[0].confirmationSentAt).toBeNull();
	});

	it('gives the mark back when sending throws', async () => {
		const stored = [booking()];
		const { service } = build(stored, [new Error('smtp down')]);

		await service.sendConfirmation('b1', 'ru');

		expect(stored[0].confirmationSentAt).toBeNull();
	});

	it('keeps the mark for a guest with no email: there is nothing to send, ever', async () => {
		const stored = [booking({ email: null })];
		const { service, sent } = build(stored);

		await service.sendConfirmation('b1', 'ru');

		expect(sent).toHaveLength(0);
		expect(stored[0].confirmationSentAt).not.toBeNull();
	});
});

describe('retrying unsent confirmations', () => {
	it('sends the ones a failure left behind, and only once', async () => {
		const stored = [booking()];
		const { service, sent } = build(stored, [false]);

		await service.sendConfirmation('b1', 'ru');
		expect(stored[0].confirmationSentAt).toBeNull();

		expect(await service.retryUnsentConfirmations()).toBe(1);
		expect(await service.retryUnsentConfirmations()).toBe(0);

		expect(sent).toEqual(['a@x.am']);
		expect(stored[0].confirmationSentAt).not.toBeNull();
	});

	it('leaves old bookings alone, so nobody is mailed a confirmation from last year', async () => {
		const stored = [booking({ updatedAt: new Date(Date.now() - 7 * HOUR) })];
		const { service, sent } = build(stored);

		expect(await service.retryUnsentConfirmations()).toBe(0);
		expect(sent).toHaveLength(0);
	});

	it('leaves very fresh bookings alone: the normal send is still on its way', async () => {
		const stored = [booking({ updatedAt: new Date(Date.now() - 1 * MINUTE) })];
		const { service } = build(stored);

		expect(await service.retryUnsentConfirmations()).toBe(0);
	});

	it('skips guests without email and bookings that are not confirmed', async () => {
		const stored = [booking({ id: 'b1', email: null }), booking({ id: 'b2', status: 'PENDING' })];
		const { service, sent } = build(stored);

		expect(await service.retryUnsentConfirmations()).toBe(0);
		expect(sent).toHaveLength(0);
	});

	it('keeps trying on later rounds while the mail service stays down', async () => {
		const stored = [booking()];
		const { service, sent } = build(stored, [false, false, true]);

		await service.retryUnsentConfirmations();
		expect(stored[0].confirmationSentAt).toBeNull();
		await service.retryUnsentConfirmations();
		expect(stored[0].confirmationSentAt).toBeNull();
		await service.retryUnsentConfirmations();

		expect(sent).toEqual(['a@x.am']);
		expect(stored[0].confirmationSentAt).not.toBeNull();
	});
});
