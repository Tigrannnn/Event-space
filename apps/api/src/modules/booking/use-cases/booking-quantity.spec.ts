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
	feeWithheld: number | null;
	operationKey: string;
	reason: string | null;
	createdAt: Date;
	updatedAt: Date;
}

interface World {
	status?: string;
	userId?: string;
	quantity?: number;
	amount?: number;
	checkedInAt?: Date | null;
	tourInHours?: number;
	spotsFree?: number;
	seatsRelease?: boolean;
	staleGuard?: boolean;
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
			feeWithheld: data.feeWithheld === undefined ? null : Number(data.feeWithheld),
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
		quantity: world.quantity ?? 3,
		amount: world.amount ?? 30000,
		occurrenceId: 'o1',
		checkedInAt: world.checkedInAt ?? null,
		occurrence: {
			id: 'o1',
			date: occurrenceDate,
			maxParticipants: 10,
			currentParticipants: 10 - (world.spotsFree ?? 5),
			event: {
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
					const numeric = key === 'amount' || key === 'feeAmount' || key === 'feeWithheld';
					(row as unknown as Record<string, unknown>)[key] = numeric ? Number(String(value)) : value;
				}
			}
			return Promise.resolve({ count: matched.length });
		},
		aggregate: () => Promise.resolve({ _sum: { feeWithheld: null } }),
		upsert: (args: { create: Record<string, unknown> }) => Promise.resolve(insert(args.create)),
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

	const service = createBookingService(prisma as never, stripe as never, {} as never);
	return { service, table, stripeCalls, seatUpdates, bookingUpdates };
}

const client = { kind: 'client', userId: 'u1' } as const;
const admin = { kind: 'admin' } as const;

const refundRows = (table: Row[]) => table.filter((row) => row.type === 'REFUND');
const stripeRefunds = (calls: { method: string; args: unknown[] }[]) =>
	calls.filter((call) => call.method === 'refund').map((call) => call.args);

describe('quoting fewer guests', () => {
	it('shows the refund for the removed guest only, with the fee share held back', async () => {
		const { service } = build();
		const quote = await service.quoteQuantity(client, 'b1', { quantity: 2 });

		expect(quote).toMatchObject({
			direction: 'DECREASE',
			currentQuantity: 3,
			newQuantity: 2,
			unitPriceInCents: 1000000,
			currentAmountInCents: 3000000,
			newAmountInCents: 2000000,
			dueInCents: 0,
			refund: { percentage: 100, grossInCents: 1000000, netInCents: 970000 },
		});
	});

	it('applies the cancellation rules that are in force today', async () => {
		const { service } = build({ tourInHours: 30 });
		const quote = await service.quoteQuantity(client, 'b1', { quantity: 2 });

		expect(quote.refund).toMatchObject({ percentage: 50, grossInCents: 500000, netInCents: 470000 });
	});

	it('changes nothing', async () => {
		const { service, table, bookingUpdates, stripeCalls } = build();
		await service.quoteQuantity(client, 'b1', { quantity: 1 });

		expect(table).toHaveLength(1);
		expect(bookingUpdates).toHaveLength(0);
		expect(stripeCalls.some((call) => call.method === 'refund')).toBe(false);
	});
});

describe('removing a guest as the client', () => {
	it('lowers the booking, frees the seat and refunds the guest through Stripe', async () => {
		const { service, table, stripeCalls, seatUpdates, bookingUpdates } = build();
		const result = await service.changeQuantity(client, 'b1', {
			quantity: 2,
			expectedRefundInCents: 970000,
		});

		expect(result).toMatchObject({ bookingId: 'b1', quantity: 2, amount: 20000 });
		expect(bookingUpdates[0]).toMatchObject({
			where: { id: 'b1', status: 'CONFIRMED', quantity: 3, checkedInAt: null },
		});
		expect(seatUpdates[0]).toEqual({
			where: { id: 'o1', currentParticipants: { gte: 1 } },
			data: { currentParticipants: { decrement: 1 } },
		});

		const [call] = stripeRefunds(stripeCalls);
		expect(call?.[0]).toBe('pi_1');
		expect(String(call?.[1])).toMatch(/^qty:/);
		expect(call?.[2]).toBe(970000);

		const [refund] = refundRows(table);
		expect(refund).toMatchObject({
			status: 'SUCCEEDED',
			amount: 9700,
			feeWithheld: 300,
			stripePaymentIntentId: 'pi_1',
			reason: 'Booking changed from 3 to 2 guests',
		});
		expect(refund.operationKey).toMatch(/^qty:/);
	});

	it('reads the Stripe fee first when it was not recorded yet', async () => {
		const { service, table } = build({
			charges: [{ pi: 'pi_1', amount: 30000, fee: null }],
			fee: 90000,
		});
		await service.changeQuantity(client, 'b1', { quantity: 2, expectedRefundInCents: 970000 });

		expect(table.find((row) => row.type === 'CHARGE')?.feeAmount).toBe(900);
		expect(refundRows(table)[0]).toMatchObject({ amount: 9700, feeWithheld: 300 });
	});

	it('refuses when the refund is no longer the one that was shown', async () => {
		const { service, table, bookingUpdates, stripeCalls } = build({ tourInHours: 30 });

		await expect(
			service.changeQuantity(client, 'b1', { quantity: 2, expectedRefundInCents: 970000 }),
		).rejects.toMatchObject({ code: 'QUANTITY_QUOTE_CHANGED' });
		expect(bookingUpdates).toHaveLength(0);
		expect(refundRows(table)).toHaveLength(0);
		expect(stripeRefunds(stripeCalls)).toHaveLength(0);
	});

	it('goes through when the refund is the one that was shown', async () => {
		const { service } = build();
		await expect(
			service.changeQuantity(client, 'b1', { quantity: 2, expectedRefundInCents: 970000 }),
		).resolves.toMatchObject({ quantity: 2 });
	});

	it('keeps the refund queued for a retry when Stripe refuses', async () => {
		const { service, table } = build({ stripeFails: true });
		await service.changeQuantity(client, 'b1', { quantity: 2, expectedRefundInCents: 970000 });

		expect(refundRows(table)).toHaveLength(1);
		expect(refundRows(table)[0]).toMatchObject({ status: 'PENDING', amount: 9700 });
	});

	it('keeps two partial refunds of the same payment side by side', async () => {
		const { service, table } = build();
		await service.changeQuantity(client, 'b1', { quantity: 2, expectedRefundInCents: 970000 });

		const second = build({ quantity: 2, amount: 20000 });
		second.table.splice(0, second.table.length, ...table.map((row) => ({ ...row })));
		await second.service.changeQuantity(client, 'b1', { quantity: 1, expectedRefundInCents: 970000 });

		const keys = refundRows(second.table).map((row) => row.operationKey);
		expect(keys).toHaveLength(2);
		expect(new Set(keys).size).toBe(2);
	});

	it('refunds nothing for a booking that is paid on arrival', async () => {
		const { service, table, stripeCalls } = build({ charges: [] });
		const result = await service.changeQuantity(client, 'b1', {
			quantity: 2,
			expectedRefundInCents: 0,
		});

		expect(result).toMatchObject({ quantity: 2, amount: 20000 });
		expect(table).toHaveLength(0);
		expect(stripeRefunds(stripeCalls)).toHaveLength(0);
	});

	it('writes nothing and gives the seat back to nobody when the booking changed at the same time', async () => {
		const { service, table, stripeCalls } = build({ staleGuard: true });

		await expect(
			service.changeQuantity(client, 'b1', { quantity: 2, expectedRefundInCents: 970000 }),
		).rejects.toMatchObject({
			code: 'BOOKING_CHANGED_CONCURRENTLY',
		});
		expect(refundRows(table)).toHaveLength(0);
		expect(stripeRefunds(stripeCalls)).toHaveLength(0);
	});

	it('does not change anything unless the client confirms the refund that was shown', async () => {
		const { service, bookingUpdates, table } = build();

		await expect(service.changeQuantity(client, 'b1', { quantity: 2 })).rejects.toMatchObject({
			code: 'QUANTITY_QUOTE_CHANGED',
		});
		expect(bookingUpdates).toHaveLength(0);
		expect(refundRows(table)).toHaveLength(0);
	});

	it('does not look anything up at Stripe for someone else’s booking', async () => {
		const { service, stripeCalls } = build({
			userId: 'u2',
			charges: [{ pi: 'pi_1', amount: 30000, fee: null }],
		});

		await expect(
			service.changeQuantity(client, 'b1', { quantity: 2, expectedRefundInCents: 970000 }),
		).rejects.toMatchObject({ code: 'NOT_YOUR_BOOKING' });
		expect(stripeCalls).toHaveLength(0);
	});

	it('leaves the cash part for an admin to hand back, when the client removes a guest', async () => {
		const { service, table } = build({
			quantity: 4,
			amount: 40000,
			charges: [
				{ pi: 'pi_1', amount: 30000, fee: 900, at: 1 },
				{ pi: null, amount: 10000, at: 3 },
			],
		});
		await service.changeQuantity(client, 'b1', { quantity: 3, expectedRefundInCents: 1000000 });

		const cash = refundRows(table).find((row) => row.stripePaymentIntentId === null);
		expect(cash).toMatchObject({ status: 'PENDING', amount: 10000 });
	});
});

describe('who may change the number of guests', () => {
	it('refuses someone else’s booking', async () => {
		const { service } = build({ userId: 'u2' });
		await expect(service.quoteQuantity(client, 'b1', { quantity: 2 })).rejects.toMatchObject({
			code: 'NOT_YOUR_BOOKING',
		});
	});

	it('refuses a booking that is not confirmed or already attended', async () => {
		await expect(
			build({ status: 'PENDING' }).service.quoteQuantity(client, 'b1', { quantity: 2 }),
		).rejects.toMatchObject({ code: 'BOOKING_NOT_CONFIRMED' });
		await expect(
			build({ checkedInAt: new Date() }).service.quoteQuantity(client, 'b1', { quantity: 2 }),
		).rejects.toMatchObject({ code: 'ALREADY_CHECKED_IN' });
	});

	it('refuses a client once the tour has started, but not an admin', async () => {
		const started = build({ tourInHours: -2 });
		await expect(started.service.quoteQuantity(client, 'b1', { quantity: 2 })).rejects.toMatchObject({
			code: 'TOUR_ALREADY_STARTED',
		});
		await expect(started.service.quoteQuantity(admin, 'b1', { quantity: 2 })).resolves.toMatchObject({
			direction: 'DECREASE',
		});
	});

	it('refuses the same number of guests', async () => {
		await expect(build().service.quoteQuantity(client, 'b1', { quantity: 3 })).rejects.toMatchObject({
			code: 'QUANTITY_UNCHANGED',
		});
	});

	it('does not let a client add guests yet', async () => {
		await expect(build().service.quoteQuantity(client, 'b1', { quantity: 4 })).rejects.toMatchObject({
			code: 'QUANTITY_INCREASE_NOT_AVAILABLE',
		});
	});

	it('does not let a client pick how the money is settled', async () => {
		await expect(
			build().service.quoteQuantity(client, 'b1', { quantity: 2, settlement: 'FULL' }),
		).rejects.toMatchObject({ code: 'QUANTITY_SETTLEMENT_INVALID' });
	});
});

describe('removing a guest as an admin', () => {
	it('refunds in full when the admin says so, even after the free window', async () => {
		const { service, stripeCalls } = build({ tourInHours: 5 });
		await service.changeQuantity(admin, 'b1', { quantity: 2, settlement: 'FULL' });

		expect(stripeRefunds(stripeCalls)[0]?.[2]).toBe(970000);
	});

	it('refunds nothing when the admin keeps the money', async () => {
		const { service, table, stripeCalls } = build();
		const result = await service.changeQuantity(admin, 'b1', { quantity: 2, settlement: 'NONE' });

		expect(result).toMatchObject({ quantity: 2, amount: 20000 });
		expect(refundRows(table)).toHaveLength(0);
		expect(stripeRefunds(stripeCalls)).toHaveLength(0);
	});

	it('uses the rules when the admin does not say', async () => {
		const { service } = build();
		await expect(service.quoteQuantity(admin, 'b1', { quantity: 2 })).resolves.toMatchObject({
			settlement: 'RULES',
		});
	});

	it('rejects a settlement that belongs to adding guests', async () => {
		await expect(
			build().service.quoteQuantity(admin, 'b1', { quantity: 2, settlement: 'OFFLINE_PAID' }),
		).rejects.toMatchObject({ code: 'QUANTITY_SETTLEMENT_INVALID' });
	});

	it('hands the cash part back by hand and the card part through Stripe', async () => {
		const { service, table, stripeCalls } = build({
			quantity: 4,
			amount: 40000,
			charges: [
				{ pi: 'pi_1', amount: 30000, fee: 900, at: 1 },
				{ pi: null, amount: 10000, at: 3 },
			],
		});
		await service.changeQuantity(admin, 'b1', { quantity: 2, settlement: 'FULL' });

		const refunds = refundRows(table);
		expect(refunds.map((row) => [row.stripePaymentIntentId, row.status, row.amount])).toEqual(
			expect.arrayContaining([
				[null, 'SUCCEEDED', 10000],
				['pi_1', 'SUCCEEDED', 9700],
			]),
		);
		expect(stripeRefunds(stripeCalls)).toHaveLength(1);
	});
});

describe('adding guests as an admin', () => {
	it('takes the seats and records the cash that was received', async () => {
		const { service, table, seatUpdates } = build();
		const result = await service.changeQuantity(admin, 'b1', {
			quantity: 4,
			settlement: 'OFFLINE_PAID',
		});

		expect(result).toMatchObject({ quantity: 4, amount: 40000 });
		expect(seatUpdates[0]).toEqual({
			where: { id: 'o1', currentParticipants: { lte: 9 } },
			data: { currentParticipants: { increment: 1 } },
		});

		const added = table.find((row) => row.type === 'CHARGE' && row.stripePaymentIntentId === null);
		expect(added).toMatchObject({ status: 'SUCCEEDED', amount: 10000, bookingId: 'b1' });
	});

	it('leaves the new guest’s money to be collected on arrival', async () => {
		const { service, table } = build();
		const result = await service.changeQuantity(admin, 'b1', { quantity: 4 });

		expect(result.quote).toMatchObject({ settlement: 'PAY_ON_ARRIVAL', dueInCents: 1000000 });
		expect(table.filter((row) => row.type === 'CHARGE')).toHaveLength(1);
	});

	it('prices the new guest at what the others paid, not at today’s price', async () => {
		const { service } = build({ amount: 24000, quantity: 3 });
		const quote = await service.quoteQuantity(admin, 'b1', { quantity: 4 });

		expect(quote).toMatchObject({ unitPriceInCents: 800000, newAmountInCents: 3200000 });
	});

	it('refuses when there are not enough seats left', async () => {
		await expect(
			build({ spotsFree: 0 }).service.quoteQuantity(admin, 'b1', { quantity: 4 }),
		).rejects.toMatchObject({ code: 'NO_SPOTS_AVAILABLE' });
		await expect(
			build({ spotsFree: 1 }).service.quoteQuantity(admin, 'b1', { quantity: 6 }),
		).rejects.toMatchObject({ code: 'NOT_ENOUGH_SPOTS' });
	});

	it('rejects a settlement that belongs to removing guests', async () => {
		await expect(
			build().service.quoteQuantity(admin, 'b1', { quantity: 4, settlement: 'RULES' }),
		).rejects.toMatchObject({ code: 'QUANTITY_SETTLEMENT_INVALID' });
	});
});
