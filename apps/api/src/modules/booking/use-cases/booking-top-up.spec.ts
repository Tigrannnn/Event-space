import { createBookingKit } from '../testing/booking.test-helpers';

const HOUR = 60 * 60 * 1000;

interface World {
	userId?: string;
	tourInHours?: number;
	spotsFree?: number;
	seatsTaken?: boolean;
	refundFails?: boolean;
	createFails?: boolean;
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
	operationKey: string;
	reason: string | null;
	createdAt: Date;
	updatedAt: Date;
}

interface Intent {
	status: string;
	amount: number;
	metadata: Record<string, string>;
}

function build(world: World = {}) {
	let sequence = 0;
	const stripeCalls: { method: string; args: unknown[] }[] = [];
	const emails: { kind: string; payload: Record<string, unknown> }[] = [];
	const table: Row[] = [];
	const booking = { status: 'CONFIRMED', quantity: 2, amount: 20000 };
	const intents = new Map<string, Intent>();

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

	const bookingRow = () => ({
		id: 'b1',
		userId: 'u1',
		status: booking.status,
		quantity: booking.quantity,
		amount: booking.amount,
		paymentMethod: 'SITE_PAYMENT',
		paymentIntentId: 'pi_orig',
		occurrenceId: 'o1',
		checkedInAt: null,
		referenceNumber: 42,
		brandHost: null,
		user: { email: 'a@x.am', name: 'Ани', locale: 'ru' },
		occurrence: {
			id: 'o1',
			date: new Date(Date.now() + (world.tourInHours ?? 240) * HOUR),
			status: 'ACTIVE',
			maxParticipants: 10,
			currentParticipants: 10 - (world.spotsFree ?? 5),
			event: {
				translations: [{ locale: 'ru', title: 'Татев' }],
				cancellationRules: [{ hoursBeforeEvent: 72, refundPercentage: 100 }],
			},
		},
	});

	const matches = (row: Row, where: Record<string, unknown>): boolean =>
		Object.entries(where).every(([key, value]) => {
			if (key === 'updatedAt') return true;
			if (key === 'amount' && value && typeof value === 'object') {
				return row.amount > Number((value as { gt: number }).gt);
			}
			if (key === 'stripePaymentIntentId' && value && typeof value === 'object') {
				return row.stripePaymentIntentId !== null;
			}
			if (key === 'feeAmount') return value === null ? row.feeAmount === null : true;
			return (row as unknown as Record<string, unknown>)[key] === value;
		});

	const sameKey = (row: Row, data: Record<string, unknown>) =>
		row.stripePaymentIntentId === data.stripePaymentIntentId &&
		row.type === data.type &&
		row.operationKey === ((data.operationKey as string | undefined) ?? '');

	const adjustments = {
		findMany: (args: { where: Record<string, unknown> }) =>
			Promise.resolve(table.filter((row) => matches(row, args.where)).map((row) => ({ ...row }))),
		createMany: (args: { data: Record<string, unknown>[] }) => {
			const fresh = args.data.filter((data) => !table.some((row) => sameKey(row, data)));
			fresh.forEach(insert);
			return Promise.resolve({ count: fresh.length });
		},
		create: (args: { data: Record<string, unknown> }) => {
			if (table.some((row) => sameKey(row, args.data))) {
				return Promise.reject(Object.assign(new Error('unique'), { code: 'P2002' }));
			}
			return Promise.resolve(insert(args.data));
		},
		updateMany: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
			const matched = table.filter((row) => matches(row, args.where));
			for (const row of matched) {
				for (const [key, value] of Object.entries(args.data)) {
					const numeric = key === 'amount' || key === 'feeAmount';
					(row as unknown as Record<string, unknown>)[key] = numeric ? Number(value) : value;
				}
			}
			return Promise.resolve({ count: matched.length });
		},
		upsert: (args: {
			where: { stripePaymentIntentId_type_operationKey: Record<string, unknown> };
			create: Record<string, unknown>;
			update: Record<string, unknown>;
		}) => {
			const found = table.find((row) =>
				sameKey(row, args.where.stripePaymentIntentId_type_operationKey),
			);
			if (found) Object.assign(found, args.update);
			return Promise.resolve(found ?? insert(args.create));
		},
	};

	const bookingModel = {
		findUnique: () => Promise.resolve(bookingRow()),
		updateMany: (args: {
			where: { quantity: number };
			data: { quantity: number; amount: unknown };
		}) => {
			if (args.where.quantity !== booking.quantity || booking.status !== 'CONFIRMED') {
				return Promise.resolve({ count: 0 });
			}
			booking.quantity = args.data.quantity;
			booking.amount = Number(args.data.amount);
			return Promise.resolve({ count: 1 });
		},
	};

	const tx = {
		booking: bookingModel,
		eventOccurrence: {
			updateMany: () => Promise.resolve({ count: world.seatsTaken ? 0 : 1 }),
		},
		bookingAdjustment: adjustments,
	};

	const prisma = {
		$transaction: async (fn: (t: unknown) => unknown) => {
			const snapshot = { table: table.map((row) => ({ ...row })), booking: { ...booking } };
			try {
				return await fn(tx);
			} catch (error) {
				table.splice(0, table.length, ...snapshot.table);
				Object.assign(booking, snapshot.booking);
				throw error;
			}
		},
		booking: bookingModel,
		bookingAdjustment: adjustments,
	};

	const intentView = (id: string) => {
		const intent = intents.get(id) as Intent;
		return {
			id,
			status: intent.status,
			amount: intent.amount,
			amount_received: intent.status === 'succeeded' ? intent.amount : 0,
			metadata: intent.metadata,
			latest_charge: 'ch_1',
		};
	};

	const stripe = {
		createPaymentIntent: (amount: number, currency: string, metadata: Record<string, string>) => {
			stripeCalls.push({ method: 'createPaymentIntent', args: [amount, currency, metadata] });
			if (world.createFails) {
				return Promise.reject(Object.assign(new Error('network'), { type: 'StripeConnectionError' }));
			}
			const id = `pi_guests${intents.size + 1}`;
			intents.set(id, {
				status: 'requires_payment_method',
				amount: Math.round(amount * 100),
				metadata,
			});
			return Promise.resolve({ id, client_secret: `${id}_secret` });
		},
		retrievePaymentIntent: (id: string) => {
			stripeCalls.push({ method: 'retrievePaymentIntent', args: [id] });
			return Promise.resolve(intentView(id));
		},
		searchPaymentIntents: (query: string) => {
			stripeCalls.push({ method: 'searchPaymentIntents', args: [query] });
			return Promise.resolve(
				[...intents.keys()].filter((id) => intents.get(id)?.status === 'succeeded').map(intentView),
			);
		},
		getCharge: () => Promise.resolve({ balance_transaction: { fee: 600 } }),
		refund: (pi: string, key: string, amount: number) => {
			stripeCalls.push({ method: 'refund', args: [pi, key, amount] });
			if (world.refundFails) return Promise.reject(new Error('stripe down'));
			return Promise.resolve({ id: `re_${pi}`, amount });
		},
		cancelPaymentIntent: () => Promise.resolve({}),
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

	const kit = createBookingKit(prisma as never, stripe as never, mail as never);

	const pay = (id: string, amountInCents?: number) => {
		const intent = intents.get(id) as Intent;
		intent.status = 'succeeded';
		if (amountInCents !== undefined) intent.amount = amountInCents;
	};

	return { ...kit, booking, table, stripeCalls, emails, intents, pay };
}

const refunds = (calls: { method: string; args: unknown[] }[]) =>
	calls.filter((call) => call.method === 'refund').map((call) => call.args);

describe('client pays for added guests', () => {
	it('opens a card payment for the extra amount and changes nothing yet', async () => {
		const { service, booking, stripeCalls } = build();
		const payment = await service.startQuantityPayment('u1', 'b1', { quantity: 4 });

		expect(payment).toMatchObject({
			paymentIntentId: 'pi_guests1',
			clientSecret: 'pi_guests1_secret',
		});
		expect(payment.quote).toMatchObject({ newQuantity: 4, dueInCents: 2_000_000 });
		expect(stripeCalls[0].args).toEqual([
			20000,
			'AMD',
			{
				kind: 'guests',
				bookingId: 'b1',
				userId: 'u1',
				fromQuantity: '2',
				toQuantity: '4',
				amountInCents: '2000000',
			},
		]);
		expect(booking).toMatchObject({ quantity: 2, amount: 20000 });
	});

	it('refuses to open a payment for fewer guests or when spots are missing', async () => {
		await expect(
			build().service.startQuantityPayment('u1', 'b1', { quantity: 1 }),
		).rejects.toMatchObject({
			code: 'QUANTITY_SETTLEMENT_INVALID',
		});
		await expect(
			build({ spotsFree: 1 }).service.startQuantityPayment('u1', 'b1', { quantity: 4 }),
		).rejects.toMatchObject({ code: 'NOT_ENOUGH_SPOTS' });
	});

	it('says so when Stripe cannot be reached', async () => {
		const { service } = build({ createFails: true });
		await expect(service.startQuantityPayment('u1', 'b1', { quantity: 4 })).rejects.toMatchObject({
			code: 'PAYMENT_SERVICE_UNAVAILABLE',
		});
	});

	it('waits while the card is not paid', async () => {
		const { service, booking } = build();
		const { paymentIntentId } = await service.startQuantityPayment('u1', 'b1', { quantity: 4 });

		expect(await service.reconcileQuantityPayment('u1', 'b1', paymentIntentId)).toEqual({
			paymentIntentId,
			status: 'PENDING',
		});
		expect(booking.quantity).toBe(2);
	});

	it('adds the guests once the money arrives, exactly once', async () => {
		const { service, booking, table, emails, pay } = build();
		const { paymentIntentId } = await service.startQuantityPayment('u1', 'b1', { quantity: 4 });
		pay(paymentIntentId);

		expect((await service.reconcileQuantityPayment('u1', 'b1', paymentIntentId)).status).toBe(
			'APPLIED',
		);
		expect((await service.reconcileQuantityPayment('u1', 'b1', paymentIntentId)).status).toBe(
			'APPLIED',
		);

		expect(booking).toMatchObject({ quantity: 4, amount: 40000 });
		expect(table.filter((row) => row.stripePaymentIntentId === paymentIntentId)).toMatchObject([
			{ type: 'CHARGE', status: 'SUCCEEDED', amount: 20000 },
		]);
		expect(emails).toHaveLength(1);
		expect(emails[0].payload).toMatchObject({
			newQuantity: 4,
			extra: { kind: 'paidByCard', amount: 20000 },
		});
	});

	it('is applied by the Stripe webhook path as well', async () => {
		const { service, booking, pay } = build();
		const { paymentIntentId } = await service.startQuantityPayment('u1', 'b1', { quantity: 3 });
		pay(paymentIntentId);

		expect(await service.reconcilePayment(paymentIntentId)).toBeNull();
		expect(booking.quantity).toBe(3);
	});

	it('is applied by the background sweep when nobody came back', async () => {
		const { service, topUps, booking, pay } = build();
		const { paymentIntentId } = await service.startQuantityPayment('u1', 'b1', { quantity: 3 });
		pay(paymentIntentId);

		expect(await topUps.sweep(new Date(Date.now() - 24 * HOUR))).toBe(1);
		expect(booking.quantity).toBe(3);
	});

	it('refunds the whole payment when the booking changed while the client paid', async () => {
		const { service, booking, stripeCalls, emails, pay } = build();
		const { paymentIntentId } = await service.startQuantityPayment('u1', 'b1', { quantity: 4 });
		booking.quantity = 3;
		pay(paymentIntentId);

		expect((await service.reconcileQuantityPayment('u1', 'b1', paymentIntentId)).status).toBe(
			'FAILED',
		);
		expect(refunds(stripeCalls)).toEqual([
			[paymentIntentId, `guests-fail:${paymentIntentId}`, 2_000_000],
		]);
		expect(booking.amount).toBe(20000);
		expect(emails[0]).toMatchObject({ kind: 'notAdded', payload: { refundAmount: 20000 } });
		expect((await service.reconcileQuantityPayment('u1', 'b1', paymentIntentId)).status).toBe(
			'FAILED',
		);
		expect(refunds(stripeCalls)).toHaveLength(1);
	});

	it('refunds the whole payment when the spots were taken meanwhile', async () => {
		const { service, booking, stripeCalls, pay } = build({ seatsTaken: true });
		const { paymentIntentId } = await service.startQuantityPayment('u1', 'b1', { quantity: 4 });
		pay(paymentIntentId);

		expect((await service.reconcileQuantityPayment('u1', 'b1', paymentIntentId)).status).toBe(
			'FAILED',
		);
		expect(refunds(stripeCalls)).toHaveLength(1);
		expect(booking.quantity).toBe(2);
	});

	it('refunds a payment whose amount does not match the extra amount', async () => {
		const { service, stripeCalls, pay } = build();
		const { paymentIntentId } = await service.startQuantityPayment('u1', 'b1', { quantity: 4 });
		pay(paymentIntentId, 500_000);

		expect((await service.reconcileQuantityPayment('u1', 'b1', paymentIntentId)).status).toBe(
			'FAILED',
		);
		expect(refunds(stripeCalls)[0][2]).toBe(500_000);
	});

	it('keeps the refund queued when Stripe refuses it', async () => {
		const { service, table, pay } = build({ refundFails: true });
		const { paymentIntentId } = await service.startQuantityPayment('u1', 'b1', { quantity: 4 });
		const second = (await service.startQuantityPayment('u1', 'b1', { quantity: 3 })).paymentIntentId;
		pay(paymentIntentId);
		pay(second);

		await service.reconcileQuantityPayment('u1', 'b1', paymentIntentId);
		expect((await service.reconcileQuantityPayment('u1', 'b1', second)).status).toBe('FAILED');
		expect(
			table.find((row) => row.stripePaymentIntentId === second && row.type === 'REFUND'),
		).toMatchObject({
			status: 'PENDING',
		});
	});

	it('reports a payment the client abandoned', async () => {
		const { service, intents } = build();
		const { paymentIntentId } = await service.startQuantityPayment('u1', 'b1', { quantity: 4 });
		(intents.get(paymentIntentId) as Intent).status = 'canceled';

		expect((await service.reconcileQuantityPayment('u1', 'b1', paymentIntentId)).status).toBe(
			'CANCELLED',
		);
	});

	it('does not show one client the payment of another', async () => {
		const { service } = build();
		const { paymentIntentId } = await service.startQuantityPayment('u1', 'b1', { quantity: 4 });

		await expect(service.reconcileQuantityPayment('u2', 'b1', paymentIntentId)).rejects.toMatchObject(
			{
				code: 'BOOKING_NOT_FOUND',
			},
		);
	});
});
