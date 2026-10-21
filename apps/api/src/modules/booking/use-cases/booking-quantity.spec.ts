import { createBookingService } from '../testing/booking.test-helpers';

const HOUR = 60 * 60 * 1000;

interface Row {
	id: string;
	bookingId: string;
	type: 'CHARGE' | 'REFUND';
	status: 'SUCCEEDED' | 'PENDING' | 'FAILED';
	amount: number;
	stripePaymentIntentId: string | null;
	stripeRefundId: string | null;
	feeAmount: number | null;
	operationKey: string;
	reason: string | null;
	createdAt: Date;
	updatedAt: Date;
}

interface World {
	status?: string;
	paymentMethod?: string;
	userId?: string;
	quantity?: number;
	amount?: number;
	checkedInAt?: Date | null;
	tourInHours?: number;
	spotsFree?: number;
	seatsRelease?: boolean;
	staleGuard?: boolean;
	noEmail?: boolean;
	stripeFails?: boolean;
	fee?: number;
	charges?: {
		pi: string | null;
		amount: number;
		fee?: number | null;
		at?: number;
	}[];
}

function build(world: World = {}) {
	const table: Row[] = [];
	const stripeCalls: { method: string; args: unknown[] }[] = [];
	const seatUpdates: { where: Record<string, unknown>; data: Record<string, unknown> }[] = [];
	const bookingUpdates: { where: Record<string, unknown>; data: Record<string, unknown> }[] = [];
	let sequence = 0;

	const insert = (data: Record<string, unknown>): Row => {
		sequence += 1;
		const row: Row = {
			id: `adj${sequence}`,
			bookingId: data.bookingId as string,
			type: data.type as Row['type'],
			status: data.status as Row['status'],
			amount: Number(String(data.amount)),
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

	const charges = world.charges ?? [{ pi: 'pi_1', amount: 30000, fee: 900, at: 1 }];
	for (const [index, charge] of charges.entries()) {
		const row = insert({
			bookingId: 'b1',
			type: 'CHARGE',
			status: 'SUCCEEDED',
			amount: charge.amount,
			stripePaymentIntentId: charge.pi,
			feeAmount: charge.fee ?? undefined,
		});
		row.createdAt = new Date(Date.UTC(2026, 9, 1 + (charge.at ?? index + 1)));
	}

	const occurrenceDate = new Date(Date.now() + (world.tourInHours ?? 240) * HOUR);

	const bookingRow = () => ({
		id: 'b1',
		userId: world.userId ?? 'u1',
		status: world.status ?? 'CONFIRMED',
		paymentMethod: world.paymentMethod ?? 'SITE_PAYMENT',
		quantity: world.quantity ?? 3,
		amount: world.amount ?? 30000,
		occurrenceId: 'o1',
		checkedInAt: world.checkedInAt ?? null,
		referenceNumber: 42,
		brandHost: null,
		user: { email: world.noEmail ? null : 'a@x.am', name: 'Ани', locale: 'ru' },
		occurrence: {
			id: 'o1',
			date: occurrenceDate,
			maxParticipants: 10,
			currentParticipants: 10 - (world.spotsFree ?? 5),
			event: {
				translations: [{ locale: 'ru', title: 'Татев' }],
				cancellationRules: [
					{ id: 'r1', eventId: 'e1', hoursBeforeEvent: 72, refundPercentage: 100 },
					{ id: 'r2', eventId: 'e1', hoursBeforeEvent: 24, refundPercentage: 50 },
				],
			},
		},
	});

	const matches = (row: Row, where: Record<string, unknown>): boolean =>
		Object.entries(where).every(([key, value]) => {
			if (key === 'amount' && value && typeof value === 'object' && 'gt' in value) {
				return row.amount > Number(String(value.gt));
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
					const numeric = key === 'amount' || key === 'feeAmount';
					(row as unknown as Record<string, unknown>)[key] = numeric ? Number(String(value)) : value;
				}
			}
			return Promise.resolve({ count: matched.length });
		},
		upsert: (args: {
			where: { stripePaymentIntentId_type_operationKey: Record<string, unknown> };
			create: Record<string, unknown>;
			update: Record<string, unknown> & { amount?: number | string };
		}) => {
			const existing = table.find((row) =>
				matches(row, args.where.stripePaymentIntentId_type_operationKey),
			);
			if (existing) {
				Object.assign(
					existing,
					args.update,
					args.update.amount === undefined ? {} : { amount: Number(args.update.amount) },
				);
				return Promise.resolve(existing);
			}
			return Promise.resolve(insert(args.create));
		},
	};

	const tx = {
		booking: {
			findUnique: () => Promise.resolve(bookingRow()),
			updateMany: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
				bookingUpdates.push(args);
				return Promise.resolve({ count: world.staleGuard ? 0 : 1 });
			},
		},
		eventOccurrence: {
			updateMany: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
				seatUpdates.push(args);
				return Promise.resolve({ count: 1 });
			},
		},
		bookingAdjustment: adjustments,
	};

	const prisma = {
		$transaction: async (fn: (t: unknown) => unknown) => {
			const snapshot = table.map((row) => ({ ...row }));
			try {
				return await fn(tx);
			} catch (error) {
				table.splice(0, table.length, ...snapshot);
				throw error;
			}
		},
		booking: tx.booking,
		bookingAdjustment: adjustments,
	};

	const stripe = {
		retrievePaymentIntent: (id: string) => {
			stripeCalls.push({ method: 'retrievePaymentIntent', args: [id] });
			return Promise.resolve({
				id,
				status: 'succeeded',
				amount: 3000000,
				amount_received: 3000000,
				latest_charge: 'ch_1',
			});
		},
		getCharge: (id: string) => {
			stripeCalls.push({ method: 'getCharge', args: [id] });
			return Promise.resolve({ balance_transaction: { fee: world.fee ?? 90000 } });
		},
		refund: (pi: string, key: string, amount: number) => {
			stripeCalls.push({ method: 'refund', args: [pi, key, amount] });
			if (world.stripeFails) return Promise.reject(new Error('stripe down'));
			return Promise.resolve({ id: `re_${key}`, amount });
		},
		cancelPaymentIntent: () => Promise.resolve({}),
	};

	const emails: Record<string, unknown>[] = [];
	const mail = {
		sendBookingQuantityChanged: (payload: Record<string, unknown>) => {
			emails.push(payload);
			return Promise.resolve(true);
		},
	};

	const service = createBookingService(prisma as never, stripe as never, mail as never);
	return { service, table, stripeCalls, seatUpdates, bookingUpdates, emails };
}

const client = { kind: 'client', userId: 'u1' } as const;
const admin = { kind: 'admin' } as const;

const refundRows = (table: Row[]) => table.filter((row) => row.type === 'REFUND');
const stripeRefunds = (calls: { method: string; args: unknown[] }[]) =>
	calls.filter((call) => call.method === 'refund').map((call) => call.args);

const decrease = async (service: ReturnType<typeof build>['service'], quantity = 2) => {
	const quote = await service.quoteQuantity(client, 'b1', { quantity });
	return service.changeQuantity(client, 'b1', {
		quantity,
		expectedRefundInCents: quote.refund?.netInCents,
	});
};

describe('client removes guests', () => {
	it('quotes the unit price minus that guest share of the card fee', async () => {
		const { service } = build();
		const quote = await service.quoteQuantity(client, 'b1', { quantity: 2 });

		expect(quote).toMatchObject({
			direction: 'DECREASE',
			unitPriceInCents: 1_000_000,
			newAmountInCents: 2_000_000,
			refund: {
				method: 'STRIPE',
				percentage: 100,
				grossInCents: 1_000_000,
				feeInCents: 30_000,
				netInCents: 970_000,
			},
		});
	});

	it('applies the cancellation rules when the tour is close', async () => {
		const { service } = build({ tourInHours: 30 });
		const quote = await service.quoteQuantity(client, 'b1', { quantity: 2 });

		expect(quote.refund).toMatchObject({ percentage: 50, netInCents: 470_000 });
	});

	it('refunds through Stripe, frees the seat and tells the client', async () => {
		const { service, table, stripeCalls, seatUpdates, bookingUpdates, emails } = build();
		await decrease(service);

		const [refund] = stripeRefunds(stripeCalls);
		expect(refund[0]).toBe('pi_1');
		expect(refund[1]).toMatch(/^qty:.+:pi_1$/);
		expect(refund[2]).toBe(970_000);
		expect(refundRows(table)).toMatchObject([{ status: 'SUCCEEDED', amount: 9700 }]);
		expect(bookingUpdates[0].data).toMatchObject({ quantity: 2 });
		expect(String(bookingUpdates[0].data.amount)).toBe('20000');
		expect(seatUpdates[0].data).toEqual({ currentParticipants: { decrement: 1 } });
		expect(emails[0]).toMatchObject({
			refund: { kind: 'refunded', amount: 9700 },
			byOrganiser: false,
		});
	});

	it('refuses when the refund changed since the client saw it', async () => {
		const { service, table } = build();
		await expect(
			service.changeQuantity(client, 'b1', { quantity: 2, expectedRefundInCents: 1 }),
		).rejects.toMatchObject({ code: 'QUANTITY_QUOTE_CHANGED' });
		expect(refundRows(table)).toHaveLength(0);
	});

	it('writes nothing when the booking changed at the same time', async () => {
		const { service, table, stripeCalls } = build({ staleGuard: true });
		await expect(decrease(service)).rejects.toMatchObject({ code: 'BOOKING_CHANGED_CONCURRENTLY' });
		expect(refundRows(table)).toHaveLength(0);
		expect(stripeRefunds(stripeCalls)).toHaveLength(0);
	});

	it('keeps the refund queued and says so when Stripe refuses', async () => {
		const { service, table, emails } = build({ stripeFails: true });
		await decrease(service);

		expect(refundRows(table)).toMatchObject([{ status: 'PENDING' }]);
		expect(emails[0]).toMatchObject({ refund: { kind: 'pending' } });
	});

	it('is refused for a booking not paid on the site', async () => {
		const { service } = build({
			paymentMethod: 'OFFLINE_PAID',
			charges: [{ pi: null, amount: 30000 }],
		});
		await expect(service.quoteQuantity(client, 'b1', { quantity: 2 })).rejects.toMatchObject({
			code: 'QUANTITY_SETTLEMENT_INVALID',
		});
	});

	it('is refused once the tour has started', async () => {
		const { service } = build({ tourInHours: -1 });
		await expect(service.quoteQuantity(client, 'b1', { quantity: 2 })).rejects.toMatchObject({
			code: 'TOUR_ALREADY_STARTED',
		});
	});

	it('is refused while the card payment is not written down yet', async () => {
		const { service } = build({ charges: [] });
		await expect(service.quoteQuantity(client, 'b1', { quantity: 2 })).rejects.toMatchObject({
			code: 'PAYMENT_SERVICE_UNAVAILABLE',
		});
	});

	it('may not choose a full refund or a manual one', async () => {
		const { service } = build();
		await expect(
			service.quoteQuantity(client, 'b1', { quantity: 2, settlement: 'FULL' }),
		).rejects.toMatchObject({ code: 'QUANTITY_SETTLEMENT_INVALID' });
		await expect(
			service.quoteQuantity(client, 'b1', { quantity: 2, refundMethod: 'MANUAL' }),
		).rejects.toMatchObject({ code: 'QUANTITY_SETTLEMENT_INVALID' });
	});
});

describe('client adds guests', () => {
	it('quotes the extra amount to pay by card', async () => {
		const { service } = build();
		const quote = await service.quoteQuantity(client, 'b1', { quantity: 5 });

		expect(quote).toMatchObject({
			direction: 'INCREASE',
			settlement: 'CARD',
			dueInCents: 2_000_000,
			refund: null,
		});
	});

	it('cannot add guests without paying', async () => {
		const { service } = build();
		await expect(service.changeQuantity(client, 'b1', { quantity: 4 })).rejects.toMatchObject({
			code: 'QUANTITY_PAYMENT_REQUIRED',
		});
	});

	it('cannot add more guests than there are free spots', async () => {
		const { service } = build({ spotsFree: 1 });
		await expect(service.quoteQuantity(client, 'b1', { quantity: 5 })).rejects.toMatchObject({
			code: 'NOT_ENOUGH_SPOTS',
		});
	});
});

describe('admin removes guests', () => {
	it('cannot add guests', async () => {
		const { service } = build();
		await expect(service.quoteQuantity(admin, 'b1', { quantity: 4 })).rejects.toMatchObject({
			code: 'QUANTITY_INCREASE_NOT_ALLOWED',
		});
	});

	it('refunds in full through Stripe, fee included', async () => {
		const { service, stripeCalls, emails } = build();
		await service.changeQuantity(admin, 'b1', { quantity: 2, settlement: 'FULL' });

		expect(stripeRefunds(stripeCalls)[0][2]).toBe(1_000_000);
		expect(emails[0]).toMatchObject({
			byOrganiser: true,
			refund: { kind: 'refunded', amount: 10000 },
		});
	});

	it('records a refund made by hand without calling Stripe', async () => {
		const { service, table, stripeCalls, emails } = build();
		await service.changeQuantity(admin, 'b1', { quantity: 2, refundMethod: 'MANUAL' });

		expect(stripeRefunds(stripeCalls)).toHaveLength(0);
		expect(refundRows(table)).toMatchObject([
			{ status: 'SUCCEEDED', amount: 9700, stripePaymentIntentId: 'pi_1' },
		]);
		expect(refundRows(table)[0].reason).toMatch(/^Refunded by an admin outside Stripe/);
		expect(emails[0]).toMatchObject({ refund: { kind: 'manual', amount: 9700 } });
	});

	it('records the refund of a booking paid in person as made by hand', async () => {
		const { service, table, stripeCalls } = build({
			paymentMethod: 'OFFLINE_PAID',
			charges: [{ pi: null, amount: 30000 }],
		});
		const result = await service.changeQuantity(admin, 'b1', { quantity: 2 });

		expect(result.quote.refund).toMatchObject({ method: 'MANUAL', netInCents: 1_000_000 });
		expect(stripeRefunds(stripeCalls)).toHaveLength(0);
		expect(refundRows(table)).toMatchObject([{ amount: 10000, stripePaymentIntentId: null }]);
	});

	it('may remove guests after the tour started', async () => {
		const { service } = build({ tourInHours: -1 });
		const quote = await service.quoteQuantity(admin, 'b1', { quantity: 2 });
		expect(quote.direction).toBe('DECREASE');
	});
});
