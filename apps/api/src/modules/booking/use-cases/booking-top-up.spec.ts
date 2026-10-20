import { createBookingService } from '../testing/booking.test-helpers';

const HOUR = 60 * 60 * 1000;

interface World {
	status?: string;
	userId?: string;
	quantity?: number;
	amount?: number;
	checkedInAt?: Date | null;
	tourInHours?: number;
	spotsFree?: number;
	seatsTaken?: boolean;
	intentStatus?: string;
	intentAmount?: number;
	refundFails?: boolean;
	existing?: {
		id: string;
		to: number;
		amountInCents: number;
		pi: string;
		status?: string;
		ageHours?: number;
	}[];
	createFails?: boolean;
}

interface Modification {
	id: string;
	bookingId: string;
	fromQuantity: number;
	toQuantity: number;
	amount: number;
	paymentIntentId: string | null;
	status: string;
	failureReason: string | null;
	createdAt: Date;
	appliedAt: Date | null;
}

interface Row {
	id: string;
	bookingId: string;
	type: string;
	status: string;
	amount: number;
	stripePaymentIntentId: string | null;
	stripeRefundId: string | null;
	feeAmount: number | null;
	feeWithheld: number | null;
	operationKey: string;
	reason: string | null;
	createdAt: Date;
	updatedAt: Date;
}

function build(world: World = {}) {
	let sequence = 0;
	const stripeCalls: { method: string; args: unknown[] }[] = [];
	const emails: { kind: string; payload: Record<string, unknown> }[] = [];
	const table: Row[] = [];
	const modifications: Modification[] = [];
	const bookingState = {
		status: world.status ?? 'CONFIRMED',
		quantity: world.quantity ?? 2,
		amount: world.amount ?? 20000,
	};
	const seat = { free: world.spotsFree ?? 5 };
	const intents = new Map<string, { status: string; amount: number }>();

	const insert = (data: Record<string, unknown>): Row => {
		sequence += 1;
		const row: Row = {
			id: `adj${sequence}`,
			bookingId: data.bookingId as string,
			type: data.type as string,
			status: data.status as string,
			amount: Number(data.amount),
			stripePaymentIntentId: (data.stripePaymentIntentId as string | null) ?? null,
			stripeRefundId: (data.stripeRefundId as string | null) ?? null,
			feeAmount: data.feeAmount === undefined ? null : Number(data.feeAmount),
			feeWithheld: data.feeWithheld === undefined ? null : Number(data.feeWithheld),
			operationKey: (data.operationKey as string | undefined) ?? '',
			reason: (data.reason as string | null) ?? null,
			createdAt: new Date(Date.UTC(2026, 9, 1, sequence)),
			updatedAt: new Date(),
		};
		table.push(row);
		return row;
	};

	insert({
		bookingId: 'b1',
		type: 'CHARGE',
		status: 'SUCCEEDED',
		amount: 20000,
		stripePaymentIntentId: 'pi_orig',
		feeAmount: 600,
	});
	intents.set('pi_orig', { status: 'succeeded', amount: 2000000 });

	for (const item of world.existing ?? []) {
		modifications.push({
			id: item.id,
			bookingId: 'b1',
			fromQuantity: 2,
			toQuantity: item.to,
			amount: item.amountInCents / 100,
			paymentIntentId: item.pi,
			status: item.status ?? 'PENDING_PAYMENT',
			failureReason: null,
			createdAt: new Date(Date.now() - (item.ageHours ?? 0) * HOUR),
			appliedAt: null,
		});
		intents.set(item.pi, { status: 'requires_payment_method', amount: item.amountInCents });
	}

	const occurrenceDate = new Date(Date.now() + (world.tourInHours ?? 240) * HOUR);

	const bookingRow = () => ({
		id: 'b1',
		userId: world.userId ?? 'u1',
		status: bookingState.status,
		quantity: bookingState.quantity,
		amount: bookingState.amount,
		occurrenceId: 'o1',
		checkedInAt: world.checkedInAt ?? null,
		referenceNumber: 42,
		brandHost: null,
		user: { email: 'a@x.am', name: 'Ани', locale: 'ru' },
		occurrence: {
			id: 'o1',
			date: occurrenceDate,
			status: 'ACTIVE',
			maxParticipants: 10,
			currentParticipants: 10 - seat.free,
			event: {
				translations: [{ locale: 'ru', title: 'Татев' }],
				cancellationRules: [{ id: 'r1', eventId: 'e1', hoursBeforeEvent: 72, refundPercentage: 100 }],
			},
		},
	});

	const matches = (row: Row, where: Record<string, unknown>): boolean =>
		Object.entries(where).every(([key, value]) => {
			if (key === 'amount' && value && typeof value === 'object' && 'gt' in value) {
				return row.amount > Number((value as { gt: number }).gt);
			}
			if (key === 'updatedAt') return true;
			if (key === 'stripePaymentIntentId' && value && typeof value === 'object') {
				return row.stripePaymentIntentId !== null;
			}
			if (key === 'feeAmount') return value === null ? row.feeAmount === null : true;
			return (row as unknown as Record<string, unknown>)[key] === value;
		});

	const adjustments = {
		findMany: (args: { where: Record<string, unknown> }) =>
			Promise.resolve(table.filter((row) => matches(row, args.where)).map((row) => ({ ...row }))),
		createMany: (args: { data: Record<string, unknown>[] }) => {
			let count = 0;
			for (const data of args.data) {
				const exists = table.some(
					(row) =>
						row.stripePaymentIntentId === data.stripePaymentIntentId &&
						row.type === data.type &&
						row.operationKey === ((data.operationKey as string | undefined) ?? ''),
				);
				if (exists) continue;
				insert(data);
				count += 1;
			}
			return Promise.resolve({ count });
		},
		create: (args: { data: Record<string, unknown> }) => Promise.resolve(insert(args.data)),
		updateMany: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
			const matched = table.filter((row) => matches(row, args.where));
			for (const row of matched) {
				for (const [key, value] of Object.entries(args.data)) {
					const numeric = key === 'amount' || key === 'feeAmount' || key === 'feeWithheld';
					(row as unknown as Record<string, unknown>)[key] = numeric ? Number(value) : value;
				}
			}
			return Promise.resolve({ count: matched.length });
		},
		upsert: (args: {
			where: {
				stripePaymentIntentId_type_operationKey: {
					stripePaymentIntentId: string;
					type: string;
					operationKey: string;
				};
			};
			create: Record<string, unknown>;
		}) => {
			const key = args.where.stripePaymentIntentId_type_operationKey;
			const found = table.find(
				(row) =>
					row.stripePaymentIntentId === key.stripePaymentIntentId &&
					row.type === key.type &&
					row.operationKey === key.operationKey,
			);
			return Promise.resolve(found ?? insert(args.create));
		},
		aggregate: () => Promise.resolve({ _sum: { feeWithheld: null } }),
	};

	const modelModification = {
		findMany: (args: { where: { bookingId?: string; status?: string; createdAt?: unknown } }) =>
			Promise.resolve(
				modifications.filter(
					(row) =>
						(!args.where.bookingId || row.bookingId === args.where.bookingId) &&
						(!args.where.status || row.status === args.where.status),
				),
			),
		findUnique: (args: { where: { id?: string; paymentIntentId?: string }; select?: unknown }) =>
			Promise.resolve(
				modifications.find(
					(row) =>
						(args.where.id !== undefined && row.id === args.where.id) ||
						(args.where.paymentIntentId !== undefined &&
							row.paymentIntentId === args.where.paymentIntentId),
				) ?? null,
			),
		findFirst: (args: { where: { id: string; bookingId: string; booking: { userId: string } } }) =>
			Promise.resolve(
				modifications.find(
					(row) =>
						row.id === args.where.id &&
						row.bookingId === args.where.bookingId &&
						args.where.booking.userId === (world.userId ?? 'u1'),
				) ?? null,
			),
		create: (args: { data: Record<string, unknown> }) => {
			const row: Modification = {
				id: args.data.id as string,
				bookingId: args.data.bookingId as string,
				fromQuantity: args.data.fromQuantity as number,
				toQuantity: args.data.toQuantity as number,
				amount: Number(args.data.amount),
				paymentIntentId: null,
				status: 'PENDING_PAYMENT',
				failureReason: null,
				createdAt: new Date(),
				appliedAt: null,
			};
			modifications.push(row);
			return Promise.resolve(row);
		},
		update: (args: { where: { id: string }; data: Partial<Modification> }) => {
			const row = modifications.find((item) => item.id === args.where.id) as Modification;
			Object.assign(row, args.data);
			return Promise.resolve(row);
		},
		delete: (args: { where: { id: string } }) => {
			const index = modifications.findIndex((item) => item.id === args.where.id);
			if (index >= 0) modifications.splice(index, 1);
			return Promise.resolve({});
		},
		updateMany: (args: { where: { id: string; status: string }; data: Partial<Modification> }) => {
			const row = modifications.find(
				(item) => item.id === args.where.id && item.status === args.where.status,
			);
			if (!row) return Promise.resolve({ count: 0 });
			Object.assign(row, args.data);
			return Promise.resolve({ count: 1 });
		},
	};

	const bookingModel = {
		findUnique: () => Promise.resolve(bookingRow()),
		updateMany: (args: {
			where: { quantity: number };
			data: { quantity: number; amount: unknown };
		}) => {
			if (args.where.quantity !== bookingState.quantity || bookingState.status !== 'CONFIRMED') {
				return Promise.resolve({ count: 0 });
			}
			bookingState.quantity = args.data.quantity;
			bookingState.amount = Number(args.data.amount);
			return Promise.resolve({ count: 1 });
		},
	};

	const tx = {
		booking: bookingModel,
		bookingModification: modelModification,
		eventOccurrence: {
			updateMany: () => {
				if (world.seatsTaken) return Promise.resolve({ count: 0 });
				return Promise.resolve({ count: 1 });
			},
		},
		bookingAdjustment: adjustments,
	};

	const prisma = {
		$transaction: async (fn: (t: unknown) => unknown) => {
			const snapshot = {
				table: table.map((row) => ({ ...row })),
				modifications: modifications.map((row) => ({ ...row })),
				booking: { ...bookingState },
			};
			try {
				return await fn(tx);
			} catch (error) {
				table.splice(0, table.length, ...snapshot.table);
				modifications.splice(0, modifications.length, ...snapshot.modifications);
				Object.assign(bookingState, snapshot.booking);
				throw error;
			}
		},
		booking: bookingModel,
		bookingModification: modelModification,
		bookingAdjustment: adjustments,
	};

	const stripe = {
		createPaymentIntent: (amount: number, currency: string, metadata: Record<string, string>) => {
			stripeCalls.push({ method: 'createPaymentIntent', args: [amount, currency, metadata] });
			if (world.createFails) {
				return Promise.reject(Object.assign(new Error('network'), { type: 'StripeConnectionError' }));
			}
			const id = `pi_new${stripeCalls.length}`;
			intents.set(id, { status: 'requires_payment_method', amount: Math.round(amount * 100) });
			return Promise.resolve({ id, client_secret: `${id}_secret` });
		},
		retrievePaymentIntent: (id: string) => {
			stripeCalls.push({ method: 'retrievePaymentIntent', args: [id] });
			const known = intents.get(id) ?? { status: 'requires_payment_method', amount: 0 };
			const status = world.intentStatus && id !== 'pi_orig' ? world.intentStatus : known.status;
			const amount =
				world.intentAmount !== undefined && id !== 'pi_orig' ? world.intentAmount : known.amount;
			return Promise.resolve({
				id,
				status,
				amount,
				amount_received: status === 'succeeded' ? amount : 0,
				client_secret: `${id}_secret`,
				latest_charge: 'ch_1',
			});
		},
		cancelPaymentIntent: (id: string, key: string) => {
			stripeCalls.push({ method: 'cancelPaymentIntent', args: [id, key] });
			const known = intents.get(id);
			if (known) known.status = 'canceled';
			return Promise.resolve({});
		},
		getCharge: () => Promise.resolve({ balance_transaction: { fee: 30000 } }),
		refund: (pi: string, key: string, amount: number) => {
			stripeCalls.push({ method: 'refund', args: [pi, key, amount] });
			if (world.refundFails) return Promise.reject(new Error('stripe down'));
			return Promise.resolve({ id: `re_${key}`, amount });
		},
	};

	const mail = {
		sendBookingQuantityChanged: (payload: Record<string, unknown>) => {
			emails.push({ kind: 'changed', payload });
			return Promise.resolve(true);
		},
		sendBookingQuantityNotAdded: (payload: Record<string, unknown>) => {
			emails.push({ kind: 'notAdded', payload });
			return Promise.resolve(true);
		},
	};

	const service = createBookingService(prisma as never, stripe as never, mail as never);
	return { service, stripeCalls, emails, table, modifications, bookingState, intents };
}

const refundCalls = (calls: { method: string; args: unknown[] }[]) =>
	calls.filter((call) => call.method === 'refund').map((call) => call.args);

describe('paying for more guests', () => {
	it('opens a card payment for exactly what the added guests cost', async () => {
		const { service, stripeCalls, modifications } = build();
		const result = await service.startQuantityPayment('u1', 'b1', { quantity: 5 });

		expect(result.quote).toMatchObject({
			direction: 'INCREASE',
			settlement: 'CARD',
			dueInCents: 3000000,
		});
		expect(result.clientSecret).toMatch(/_secret$/);
		expect(stripeCalls.find((call) => call.method === 'createPaymentIntent')?.args).toEqual([
			30000,
			'AMD',
			{ bookingId: 'b1', userId: 'u1', modificationId: result.modificationId, kind: 'guests' },
		]);
		expect(modifications).toHaveLength(1);
		expect(modifications[0]).toMatchObject({
			fromQuantity: 2,
			toQuantity: 5,
			amount: 30000,
			status: 'PENDING_PAYMENT',
			paymentIntentId: 'pi_new1',
		});
	});

	it('does not touch the booking before the money has arrived', async () => {
		const { service, bookingState, table } = build();
		await service.startQuantityPayment('u1', 'b1', { quantity: 5 });

		expect(bookingState).toMatchObject({ quantity: 2, amount: 20000 });
		expect(table).toHaveLength(1);
	});

	it('reuses a payment that is still open for the same change', async () => {
		const { service, stripeCalls } = build({
			existing: [{ id: 'm1', to: 5, amountInCents: 3000000, pi: 'pi_open' }],
		});
		const result = await service.startQuantityPayment('u1', 'b1', { quantity: 5 });

		expect(result).toMatchObject({ modificationId: 'm1', clientSecret: 'pi_open_secret' });
		expect(stripeCalls.some((call) => call.method === 'createPaymentIntent')).toBe(false);
	});

	it('closes an open payment for a different change before opening a new one', async () => {
		const { service, stripeCalls, modifications } = build({
			existing: [{ id: 'm1', to: 4, amountInCents: 2000000, pi: 'pi_old' }],
		});
		await service.startQuantityPayment('u1', 'b1', { quantity: 5 });

		expect(stripeCalls.find((call) => call.method === 'cancelPaymentIntent')?.args[0]).toBe('pi_old');
		expect(modifications.find((row) => row.id === 'm1')?.status).toBe('CANCELLED');
		expect(modifications.filter((row) => row.status === 'PENDING_PAYMENT')).toHaveLength(1);
	});

	it('refuses someone else’s booking, a smaller number and too many guests', async () => {
		await expect(
			build({ userId: 'u2' }).service.startQuantityPayment('u1', 'b1', { quantity: 5 }),
		).rejects.toMatchObject({ code: 'NOT_YOUR_BOOKING' });
		await expect(
			build().service.startQuantityPayment('u1', 'b1', { quantity: 1 }),
		).rejects.toMatchObject({ code: 'QUANTITY_SETTLEMENT_INVALID' });
		await expect(
			build({ spotsFree: 1 }).service.startQuantityPayment('u1', 'b1', { quantity: 5 }),
		).rejects.toMatchObject({ code: 'NOT_ENOUGH_SPOTS' });
	});

	it('leaves nothing behind when Stripe is unreachable', async () => {
		const { service, modifications } = build({ createFails: true });

		await expect(service.startQuantityPayment('u1', 'b1', { quantity: 5 })).rejects.toMatchObject({
			code: 'PAYMENT_SERVICE_UNAVAILABLE',
		});
		expect(modifications).toHaveLength(0);
	});

	it('does not let the client skip the payment', async () => {
		await expect(
			build().service.changeQuantity({ kind: 'client', userId: 'u1' }, 'b1', { quantity: 5 }),
		).rejects.toMatchObject({ code: 'QUANTITY_PAYMENT_REQUIRED' });
	});
});

describe('settling the payment for more guests', () => {
	const paid = async (world: World = {}) => {
		const kit = build({ ...world, intentStatus: 'succeeded' });
		const started = await kit.service.startQuantityPayment('u1', 'b1', { quantity: 5 });
		kit.intents.set('pi_new1', { status: 'succeeded', amount: 3000000 });
		return { ...kit, started };
	};

	it('adds the guests, takes the seats and records the payment next to the first one', async () => {
		const { service, bookingState, table, modifications } = await paid();
		const status = await service.reconcileQuantityPayment('u1', 'b1', modifications[0].id);

		expect(status).toMatchObject({ status: 'APPLIED' });
		expect(bookingState).toMatchObject({ quantity: 5, amount: 50000 });
		expect(modifications[0]).toMatchObject({ status: 'APPLIED' });

		const charges = table.filter((row) => row.type === 'CHARGE');
		expect(charges).toHaveLength(2);
		expect(charges[1]).toMatchObject({
			stripePaymentIntentId: 'pi_new1',
			amount: 30000,
			status: 'SUCCEEDED',
		});
	});

	it('tells the client that the extra was paid by card', async () => {
		const { service, emails, modifications } = await paid();
		await service.reconcileQuantityPayment('u1', 'b1', modifications[0].id);

		expect(emails).toHaveLength(1);
		expect(emails[0].payload).toMatchObject({
			to: 'a@x.am',
			oldQuantity: 2,
			newQuantity: 5,
			newAmount: 50000,
			byOrganiser: false,
			extra: { kind: 'paidByCard', amount: 30000 },
		});
	});

	it('applies the change once, however many times Stripe and the check ask', async () => {
		const { service, bookingState, table, emails, modifications } = await paid();
		await service.reconcilePayment('pi_new1');
		await service.reconcilePayment('pi_new1');
		await service.reconcileQuantityPayment('u1', 'b1', modifications[0].id);

		expect(bookingState.quantity).toBe(5);
		expect(table.filter((row) => row.type === 'CHARGE')).toHaveLength(2);
		expect(emails).toHaveLength(1);
	});

	it('is the webhook path that applies it, and not the booking reconcile', async () => {
		const { service, bookingState } = await paid();
		const result = await service.reconcilePayment('pi_new1', 'b1');

		expect(result).toBeNull();
		expect(bookingState.quantity).toBe(5);
	});

	it('refunds the whole payment when the spots were taken while the client paid', async () => {
		const { service, bookingState, stripeCalls, table, modifications, emails } = await paid({
			seatsTaken: true,
		});
		const status = await service.reconcileQuantityPayment('u1', 'b1', modifications[0].id);

		expect(status).toMatchObject({ status: 'FAILED' });
		expect(bookingState.quantity).toBe(2);
		expect(refundCalls(stripeCalls)).toEqual([
			['pi_new1', `mod-fail:${modifications[0].id}:pi_new1`, 3000000],
		]);

		const refund = table.find((row) => row.type === 'REFUND');
		expect(refund).toMatchObject({ status: 'SUCCEEDED', amount: 30000, feeWithheld: null });
		expect(
			table.find((row) => row.stripePaymentIntentId === 'pi_new1' && row.type === 'CHARGE'),
		).toBeDefined();
		expect(emails.map((email) => email.kind)).toEqual(['notAdded']);
		expect(emails[0].payload).toMatchObject({ refundAmount: 30000 });
	});

	it('refunds the payment when the booking was cancelled meanwhile', async () => {
		const kit = build({ intentStatus: 'succeeded' });
		const started = await kit.service.startQuantityPayment('u1', 'b1', { quantity: 5 });
		kit.bookingState.status = 'CANCELLED';
		const status = await kit.service.reconcileQuantityPayment('u1', 'b1', started.modificationId);

		expect(status.status).toBe('FAILED');
		expect(refundCalls(kit.stripeCalls)).toHaveLength(1);
		expect(kit.bookingState.quantity).toBe(2);
	});

	it('refunds the payment when the number of guests changed meanwhile', async () => {
		const kit = build({ intentStatus: 'succeeded' });
		const started = await kit.service.startQuantityPayment('u1', 'b1', { quantity: 5 });
		kit.bookingState.quantity = 3;
		const status = await kit.service.reconcileQuantityPayment('u1', 'b1', started.modificationId);

		expect(status.status).toBe('FAILED');
		expect(kit.bookingState.quantity).toBe(3);
		expect(refundCalls(kit.stripeCalls)).toHaveLength(1);
	});

	it('refunds a payment that is not for the amount that was asked', async () => {
		const kit = build({ intentStatus: 'succeeded', intentAmount: 1000000 });
		const started = await kit.service.startQuantityPayment('u1', 'b1', { quantity: 5 });
		const status = await kit.service.reconcileQuantityPayment('u1', 'b1', started.modificationId);

		expect(status.status).toBe('FAILED');
		expect(kit.bookingState.quantity).toBe(2);
		expect(refundCalls(kit.stripeCalls)[0]?.[2]).toBe(1000000);
	});

	it('keeps the refund queued when Stripe refuses it', async () => {
		const { service, table, modifications } = await paid({ seatsTaken: true, refundFails: true });
		await service.reconcileQuantityPayment('u1', 'b1', modifications[0].id);

		expect(table.find((row) => row.type === 'REFUND')).toMatchObject({
			status: 'PENDING',
			amount: 30000,
		});
	});

	it('waits while the client has not paid yet', async () => {
		const kit = build();
		const started = await kit.service.startQuantityPayment('u1', 'b1', { quantity: 5 });
		const status = await kit.service.reconcileQuantityPayment('u1', 'b1', started.modificationId);

		expect(status.status).toBe('PENDING_PAYMENT');
		expect(kit.bookingState.quantity).toBe(2);
	});

	it('closes a payment that was cancelled at Stripe', async () => {
		const kit = build({ intentStatus: 'canceled' });
		const started = await kit.service.startQuantityPayment('u1', 'b1', { quantity: 5 });
		const status = await kit.service.reconcileQuantityPayment('u1', 'b1', started.modificationId);

		expect(status.status).toBe('CANCELLED');
	});

	it('closes a payment nobody completed in time and cancels it at Stripe', async () => {
		const kit = build({
			existing: [{ id: 'm1', to: 5, amountInCents: 3000000, pi: 'pi_late', ageHours: 3 }],
		});
		const status = await kit.service.reconcileQuantityPayment('u1', 'b1', 'm1');

		expect(status.status).toBe('EXPIRED');
		expect(kit.stripeCalls.find((call) => call.method === 'cancelPaymentIntent')?.args[0]).toBe(
			'pi_late',
		);
	});

	it('only lets the owner ask about a payment', async () => {
		const { service, modifications } = await paid();
		await expect(
			service.reconcileQuantityPayment('u2', 'b1', modifications[0].id),
		).rejects.toMatchObject({ code: 'BOOKING_NOT_FOUND' });
	});
});
