import { createBookingService } from '../testing/booking.test-helpers';

const HOUR = 60 * 60 * 1000;

interface World {
	status?: string;
	paymentIntentId?: string | null;
	intentStatus?: string;
	spotsFree?: number;
	pastDate?: boolean;
	occurrenceStatus?: string;
	referenceNumber?: number | null;
	cancelFails?: boolean;
}

function build(world: World = {}) {
	const stripeCalls: { method: string; args: unknown[] }[] = [];
	const bookingUpdates: Record<string, unknown>[] = [];
	const ledger: { data: Record<string, unknown> }[] = [];
	const emails: unknown[] = [];
	const seatUpdates: unknown[] = [];

	const occurrence = {
		id: 'o1',
		status: world.occurrenceStatus ?? 'ACTIVE',
		date: new Date(Date.now() + (world.pastDate ? -5 : 240) * HOUR),
		maxParticipants: 10,
		currentParticipants: 10 - (world.spotsFree ?? 5),
	};

	const pending = {
		id: 'b1',
		userId: 'u1',
		occurrenceId: 'o1',
		status: world.status ?? 'PENDING',
		quantity: 2,
		amount: 20000,
		paymentIntentId: world.paymentIntentId === undefined ? 'pi_old' : world.paymentIntentId,
		referenceNumber: world.referenceNumber === undefined ? null : world.referenceNumber,
		occurrence,
	};

	const tx = {
		booking: {
			findUnique: () => Promise.resolve(pending),
			update: (args: { data: Record<string, unknown> }) => {
				bookingUpdates.push(args.data);
				return Promise.resolve({ ...pending, ...args.data });
			},
		},
		eventOccurrence: {
			updateMany: (args: unknown) => {
				seatUpdates.push(args);
				return Promise.resolve({ count: (world.spotsFree ?? 5) >= 2 ? 1 : 0 });
			},
		},
		bookingReference: { create: () => Promise.resolve({ id: 7 }) },
		bookingAdjustment: {
			groupBy: () => Promise.resolve([]),
			create: (args: { data: Record<string, unknown> }) => {
				ledger.push(args);
				return Promise.resolve({});
			},
		},
	};

	const prisma = {
		$transaction: (fn: (t: unknown) => unknown) => fn(tx),
		booking: {
			findUnique: (args?: { include?: Record<string, unknown> }) =>
				Promise.resolve(
					!args?.include?.user
						? pending
						: {
								...pending,
								status: 'CONFIRMED',
								paymentMethod: 'OFFLINE_PAID',
								brandHost: null,
								createdAt: new Date(),
								user: { email: 'a@x.am', name: 'Ани', locale: 'ru' },
								occurrence: {
									date: occurrence.date,
									event: {
										duration: 480,
										meetingLocationUrl: '',
										translations: [{ locale: 'ru', title: 'Татев', whatsIncluded: [] }],
										cancellationRules: [],
									},
								},
							},
				),
			updateMany: () => Promise.resolve({ count: 1 }),
		},
		bookingAdjustment: { upsert: () => Promise.resolve({}), updateMany: () => Promise.resolve({}) },
	};

	const stripe = {
		retrievePaymentIntent: (id: string) => {
			stripeCalls.push({ method: 'retrievePaymentIntent', args: [id] });
			return Promise.resolve({
				id,
				status: world.intentStatus ?? 'requires_payment_method',
				amount: 2000000,
				amount_received: 2000000,
			});
		},
		cancelPaymentIntent: (...args: unknown[]) => {
			stripeCalls.push({ method: 'cancelPaymentIntent', args });
			if (world.cancelFails) {
				return Promise.reject(Object.assign(new Error('network'), { type: 'StripeConnectionError' }));
			}
			return Promise.resolve({});
		},
		getCharge: () => Promise.resolve({ balance_transaction: { fee: 0 } }),
		refund: () => Promise.resolve({ id: 're_1', amount: 0 }),
	};

	const mail = {
		sendBookingConfirmation: (payload: unknown) => {
			emails.push(payload);
			return Promise.resolve(true);
		},
	};

	const service = createBookingService(prisma as never, stripe as never, mail as never);
	return { service, stripeCalls, bookingUpdates, ledger, emails, seatUpdates };
}

const offline = { paymentMethod: 'OFFLINE_PAID' } as const;
const onArrival = { paymentMethod: 'PAY_ON_ARRIVAL' } as const;

describe('confirming a pending booking by hand', () => {
	it('confirms it, takes the seats, numbers it and records the offline money', async () => {
		const { service, bookingUpdates, ledger, seatUpdates, emails } = build();
		const result = await service.confirmManually('b1', offline);

		expect(result).toMatchObject({
			status: 'CONFIRMED',
			paymentMethod: 'OFFLINE_PAID',
			amount: 20000,
		});
		expect(bookingUpdates[0]).toMatchObject({
			status: 'CONFIRMED',
			paymentMethod: 'OFFLINE_PAID',
			paymentIntentId: null,
			referenceNumber: 7,
		});
		expect(seatUpdates[0]).toEqual({
			where: { id: 'o1', currentParticipants: { lte: 8 } },
			data: { currentParticipants: { increment: 2 } },
		});
		expect(ledger).toHaveLength(1);
		expect(ledger[0]).toMatchObject({
			data: { bookingId: 'b1', type: 'CHARGE', status: 'SUCCEEDED', stripePaymentIntentId: null },
		});
		expect(Number(ledger[0].data.amount)).toBe(20000);
		expect(emails).toHaveLength(1);
	});

	it('records no money for a pay-on-arrival booking', async () => {
		const { service, ledger } = build();
		await expect(service.confirmManually('b1', onArrival)).resolves.toMatchObject({
			status: 'CONFIRMED',
			paymentMethod: 'PAY_ON_ARRIVAL',
		});
		expect(ledger).toHaveLength(0);
	});

	it('closes the card payment the client left open, so it cannot be paid twice', async () => {
		const { service, stripeCalls } = build();
		await service.confirmManually('b1', offline);

		expect(stripeCalls.find((call) => call.method === 'cancelPaymentIntent')?.args).toEqual([
			'pi_old',
			'manual-confirm-b1',
		]);
	});

	it('does not touch Stripe when there was no card payment', async () => {
		const { service, stripeCalls } = build({ paymentIntentId: null });
		await service.confirmManually('b1', offline);

		expect(stripeCalls).toHaveLength(0);
	});

	it('keeps the reference number the booking already had', async () => {
		const { service, bookingUpdates } = build({ referenceNumber: 31 });
		await service.confirmManually('b1', offline);

		expect(bookingUpdates[0]).toMatchObject({ referenceNumber: 31 });
	});

	it('refuses a booking that is not pending', async () => {
		for (const status of ['CONFIRMED', 'CANCELLED']) {
			const { service, bookingUpdates } = build({ status });
			await expect(service.confirmManually('b1', offline)).rejects.toMatchObject({
				code: 'BOOKING_NOT_PENDING',
			});
			expect(bookingUpdates).toHaveLength(0);
		}
	});

	it('refuses when the client has already paid by card, and does not record offline money', async () => {
		const { service, bookingUpdates, ledger } = build({ intentStatus: 'succeeded' });

		await expect(service.confirmManually('b1', offline)).rejects.toMatchObject({
			code: 'PAYMENT_ALREADY_RECEIVED',
		});
		expect(ledger.some((row) => row.data.stripePaymentIntentId === null)).toBe(false);
		expect(bookingUpdates.every((update) => update.paymentMethod !== 'OFFLINE_PAID')).toBe(true);
	});

	it('does not confirm when the card payment could not be closed', async () => {
		const { service, bookingUpdates } = build({ intentStatus: 'processing', cancelFails: true });

		await expect(service.confirmManually('b1', offline)).rejects.toBeDefined();
		expect(bookingUpdates).toHaveLength(0);
	});

	it('refuses when the seats are gone', async () => {
		const { service, bookingUpdates } = build({ spotsFree: 0 });

		await expect(service.confirmManually('b1', offline)).rejects.toBeDefined();
		expect(bookingUpdates).toHaveLength(0);
	});

	it('refuses once the tour has started or its date was cancelled', async () => {
		const started = build({ pastDate: true });
		await expect(started.service.confirmManually('b1', offline)).rejects.toMatchObject({
			code: 'EVENT_NOT_AVAILABLE_FOR_BOOKING',
		});

		const cancelled = build({ occurrenceStatus: 'CANCELLED' });
		await expect(cancelled.service.confirmManually('b1', offline)).rejects.toMatchObject({
			code: 'EVENT_NOT_AVAILABLE_FOR_BOOKING',
		});
	});
});
