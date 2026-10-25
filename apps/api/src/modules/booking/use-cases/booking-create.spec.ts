import { createBookingService } from '../testing/booking.test-helpers';

const HOUR = 60 * 60 * 1000;

interface World {
	spotsFree?: number;
	existing?: {
		status: string;
		paymentIntentId: string | null;
		referenceNumber?: number | null;
	} | null;
	existingIntentStatus?: string;
	createIntentFails?: boolean;
	published?: boolean;
	pastDate?: boolean;
	userByEmail?: { id: string; emailVerified: boolean } | null;
	discountPercent?: number | null;
}

function build(world: World = {}) {
	const stripeCalls: { method: string; args: unknown[] }[] = [];
	const upserts: { update: Record<string, unknown>; create: Record<string, unknown> }[] = [];
	const userUpdates: unknown[] = [];
	const createdUsers: Record<string, unknown>[] = [];
	const bookingUpdates: Record<string, unknown>[] = [];
	const ledger: unknown[] = [];
	const emails: unknown[] = [];

	const occurrence = {
		id: 'o1',
		status: 'ACTIVE',
		date: new Date(Date.now() + (world.pastDate ? -5 : 240) * HOUR),
		maxParticipants: 10,
		currentParticipants: 10 - (world.spotsFree ?? 5),
		discountPercent: world.discountPercent ?? null,
		event: {
			id: 'e1',
			status: world.published === false ? 'DRAFT' : 'PUBLISHED',
			price: 10000,
			cancellationRules: [{ hoursBeforeEvent: 72, refundPercentage: 100 }],
			translations: [],
			images: [],
			category: { translations: [] },
			occurrences: [],
		},
	};

	const existing = world.existing === undefined ? null : world.existing;

	const tx = {
		eventOccurrence: {
			findUnique: () => Promise.resolve(occurrence),
			updateMany: () => Promise.resolve({ count: (world.spotsFree ?? 5) >= 1 ? 1 : 0 }),
		},
		booking: {
			findUnique: () => Promise.resolve(existing),
			upsert: (args: { update: Record<string, unknown>; create: Record<string, unknown> }) => {
				upserts.push({ update: args.update, create: args.create });
				const keeps = existing && !('paymentIntentId' in args.update);
				return Promise.resolve({
					id: 'b1',
					...args.create,
					paymentIntentId: keeps ? existing?.paymentIntentId : null,
					brandHost: args.create.brandHost ?? null,
				});
			},
		},
		user: {
			findUnique: () => Promise.resolve(world.userByEmail ?? null),
			create: (args: { data: Record<string, unknown> }) => {
				createdUsers.push(args.data);
				return Promise.resolve({ id: 'shadow-1' });
			},
			update: (args: unknown) => {
				userUpdates.push(args);
				return Promise.resolve({});
			},
		},
		bookingReference: { create: () => Promise.resolve({ id: 7 }) },
		bookingAdjustment: {
			findFirst: () => Promise.resolve(null),
			groupBy: () => Promise.resolve([]),
			create: (args: unknown) => {
				ledger.push(args);
				return Promise.resolve({});
			},
		},
	};

	const prisma = {
		$transaction: (fn: (t: unknown) => unknown) => fn(tx),
		booking: {
			update: (args: { data: Record<string, unknown> }) => {
				bookingUpdates.push(args.data);
				return Promise.resolve({
					id: 'b1',
					userId: 'u1',
					occurrenceId: 'o1',
					status: args.data.status ?? 'PENDING',
					quantity: 2,
					amount: 20000,
					...args.data,
				});
			},
			findUnique: () =>
				Promise.resolve({
					id: 'b1',
					userId: 'u1',
					status: 'CONFIRMED',
					quantity: 2,
					amount: 20000,
					paymentMethod: 'OFFLINE_PAID',
					referenceNumber: 7,
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
				}),
			updateMany: () => Promise.resolve({ count: 1 }),
		},
		bookingAdjustment: { upsert: () => Promise.resolve({}), updateMany: () => Promise.resolve({}) },
	};

	const stripe = {
		createPaymentIntent: (...args: unknown[]) => {
			stripeCalls.push({ method: 'createPaymentIntent', args });
			if (world.createIntentFails) {
				return Promise.reject(Object.assign(new Error('network'), { type: 'StripeConnectionError' }));
			}
			return Promise.resolve({ id: 'pi_new', client_secret: 'secret_new' });
		},
		retrievePaymentIntent: (id: string) => {
			stripeCalls.push({ method: 'retrievePaymentIntent', args: [id] });
			return Promise.resolve({
				id,
				status: world.existingIntentStatus ?? 'requires_confirmation',
				client_secret: 'secret_existing',
			});
		},
		cancelPaymentIntent: (...args: unknown[]) => {
			stripeCalls.push({ method: 'cancelPaymentIntent', args });
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
	return {
		service,
		stripeCalls,
		upserts,
		userUpdates,
		createdUsers,
		bookingUpdates,
		ledger,
		emails,
	};
}

const create = { occurrenceId: 'o1', quantity: 2 };

describe('creating a booking', () => {
	it('creates a pending booking, a payment intent and an estimate', async () => {
		const { service, stripeCalls, upserts, userUpdates } = build();
		const result = await service.create('u1', create as never, 'hy', 'dilitour.event-space.space');

		expect(upserts[0].create).toMatchObject({
			userId: 'u1',
			occurrenceId: 'o1',
			status: 'PENDING',
			quantity: 2,
			amount: 20000,
			brandHost: 'dilitour.event-space.space',
		});
		expect(stripeCalls.find((call) => call.method === 'createPaymentIntent')?.args).toEqual([
			20000,
			'AMD',
			{ userId: 'u1', occurrenceId: 'o1', bookingId: 'b1' },
		]);
		expect(userUpdates).toEqual([{ where: { id: 'u1' }, data: { locale: 'hy' } }]);
		expect(result).toMatchObject({
			clientSecret: 'secret_new',
			booking: { paymentIntentId: 'pi_new', amount: 20000, refundPercentage: 100 },
		});
	});

	it('charges the discount set on the date and freezes what it was', async () => {
		const { service, stripeCalls, upserts } = build({ discountPercent: 20 });
		await service.create('u1', create as never, 'hy');

		expect(upserts[0].create).toMatchObject({
			quantity: 2,
			amount: 16000,
			baseAmount: 20000,
			discountPercent: 20,
		});
		expect(stripeCalls.find((call) => call.method === 'createPaymentIntent')?.args[0]).toBe(16000);
	});

	it('leaves a booking on a date without a discount at the full price', async () => {
		const { upserts, service } = build();
		await service.create('u1', create as never, 'hy');

		expect(upserts[0].create).toMatchObject({
			amount: 20000,
			baseAmount: 20000,
			discountPercent: null,
		});
	});

	it('reuses a payment intent that is still open', async () => {
		const { service, stripeCalls } = build({
			existing: { status: 'PENDING', paymentIntentId: 'pi_old' },
			existingIntentStatus: 'requires_confirmation',
		});
		const result = await service.create('u1', create as never);

		expect(stripeCalls.some((call) => call.method === 'createPaymentIntent')).toBe(false);
		expect(result).toMatchObject({ clientSecret: 'secret_existing' });
	});

	it('drops a leftover payment intent when re-booking after a cancellation', async () => {
		const { service, upserts } = build({
			existing: { status: 'CANCELLED', paymentIntentId: 'pi_old' },
		});
		await service.create('u1', create as never);

		expect(upserts[0].update).toMatchObject({ status: 'PENDING', paymentIntentId: null });
	});

	it('cancels the replaced intent once a new one exists', async () => {
		const { service, stripeCalls } = build({
			existing: { status: 'PENDING', paymentIntentId: 'pi_old' },
			existingIntentStatus: 'canceled',
		});
		await service.create('u1', create as never);

		expect(stripeCalls.find((call) => call.method === 'cancelPaymentIntent')?.args).toEqual([
			'pi_old',
			'replace-b1',
		]);
	});

	it('refuses when there are no seats', async () => {
		const { service, stripeCalls } = build({ spotsFree: 0 });
		await expect(service.create('u1', create as never)).rejects.toBeDefined();
		expect(stripeCalls).toHaveLength(0);
	});

	it('refuses when only fewer seats than asked remain', async () => {
		const { service } = build({ spotsFree: 1 });
		await expect(service.create('u1', create as never)).rejects.toBeDefined();
	});

	it('refuses an already confirmed booking', async () => {
		const { service } = build({ existing: { status: 'CONFIRMED', paymentIntentId: 'pi_x' } });
		await expect(service.create('u1', create as never)).rejects.toBeDefined();
	});

	it('refuses a draft event and a date in the past', async () => {
		await expect(
			build({ published: false }).service.create('u1', create as never),
		).rejects.toBeDefined();
		await expect(
			build({ pastDate: true }).service.create('u1', create as never),
		).rejects.toBeDefined();
	});

	it('cancels the pending booking and reports Stripe being unreachable', async () => {
		const { service, bookingUpdates } = build({ createIntentFails: true });

		await expect(service.create('u1', create as never)).rejects.toBeDefined();
		expect(bookingUpdates).toContainEqual({ status: 'CANCELLED', paymentIntentId: null });
	});
});

describe('creating a booking by an admin', () => {
	const manual = (over: Record<string, unknown> = {}) => ({
		occurrenceId: 'o1',
		quantity: 2,
		userId: 'u1',
		paymentMethod: 'OFFLINE_PAID',
		...over,
	});

	it('confirms at once, takes the seats and records offline money', async () => {
		const { service, upserts, ledger, emails } = build();
		const result = await service.createManualBooking('admin1', manual() as never);

		expect(upserts[0].create).toMatchObject({
			status: 'CONFIRMED',
			quantity: 2,
			amount: 20000,
			paymentMethod: 'OFFLINE_PAID',
			createdByAdminId: 'admin1',
			referenceNumber: 7,
			userId: 'u1',
		});
		expect(ledger).toHaveLength(1);
		expect(ledger[0]).toMatchObject({
			data: { bookingId: 'b1', type: 'CHARGE', status: 'SUCCEEDED', stripePaymentIntentId: null },
		});
		expect(Number((ledger[0] as { data: { amount: unknown } }).data.amount)).toBe(20000);
		expect(result).toMatchObject({ refundPercentage: 0, estimatedRefundInCents: 0 });
		expect(emails).toHaveLength(1);
	});

	it('books a returning guest onto the record the admin already made for them', async () => {
		const { service, upserts, createdUsers, userUpdates } = build({
			userByEmail: { id: 'guest-1', emailVerified: false },
		});

		await service.createManualBooking(
			'admin1',
			manual({ userId: undefined, name: 'Карен', phone: '+37491000000', email: 'k@x.am' }) as never,
		);

		expect(createdUsers).toHaveLength(0);
		expect(upserts[0].create).toMatchObject({ userId: 'guest-1' });
		expect(userUpdates[0]).toMatchObject({
			where: { id: 'guest-1' },
			data: { name: 'Карен', phone: '+37491000000' },
		});
	});

	it('still refuses an email that belongs to a confirmed account', async () => {
		const { service, upserts } = build({ userByEmail: { id: 'u9', emailVerified: true } });

		await expect(
			service.createManualBooking(
				'admin1',
				manual({ userId: undefined, name: 'Карен', email: 'k@x.am' }) as never,
			),
		).rejects.toMatchObject({ code: 'EMAIL_ALREADY_EXISTS' });
		expect(upserts).toHaveLength(0);
	});

	it('creates a guest record when the email is new', async () => {
		const { service, createdUsers, upserts } = build({ userByEmail: null });

		await service.createManualBooking(
			'admin1',
			manual({ userId: undefined, name: 'Нина', email: 'n@x.am' }) as never,
		);

		expect(createdUsers[0]).toMatchObject({ name: 'Нина', email: 'n@x.am', isShadow: true });
		expect(upserts[0].create).toMatchObject({ userId: 'shadow-1' });
	});

	it('does not record money for a pay-on-arrival booking', async () => {
		const { service, ledger } = build();
		await expect(
			service.createManualBooking('admin1', manual({ paymentMethod: 'PAY_ON_ARRIVAL' }) as never),
		).resolves.toMatchObject({ status: 'CONFIRMED', paymentMethod: 'PAY_ON_ARRIVAL' });
		expect(ledger).toHaveLength(0);
	});

	it('refuses when the seats are gone', async () => {
		const { service } = build({ spotsFree: 0 });
		await expect(service.createManualBooking('admin1', manual() as never)).rejects.toBeDefined();
	});

	it('stores the site the booking was made on, so its emails carry that brand', async () => {
		const { service, upserts } = build();
		await service.createManualBooking(
			'admin1',
			manual() as never,
			'hy',
			'dilitour.event-space.space',
		);

		expect(upserts[0].create).toMatchObject({ brandHost: 'dilitour.event-space.space' });
	});

	it('cancels the payment intent the client left behind', async () => {
		const { service, stripeCalls } = build({
			existing: { status: 'PENDING', paymentIntentId: 'pi_old', referenceNumber: 31 },
		});
		await service.createManualBooking('admin1', manual() as never);

		expect(stripeCalls.find((call) => call.method === 'cancelPaymentIntent')?.args).toEqual([
			'pi_old',
			'manual-override-b1',
		]);
	});

	it('keeps the reference number of a booking that already had one', async () => {
		const { service, upserts } = build({
			existing: { status: 'PENDING', paymentIntentId: null, referenceNumber: 31 },
		});
		await service.createManualBooking('admin1', manual() as never);

		expect(upserts[0].update).toMatchObject({ referenceNumber: 31 });
	});
});
