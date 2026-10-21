import { createBookingKit } from './booking.test-helpers';

export const HOUR = 60 * 60 * 1000;
export const MINUTE = 60 * 1000;

export type Call = { method: string; args: unknown[] };

export interface World {
	intentStatus?: string;
	fee?: number;
	stripeFails?: boolean;
	rules?: { hoursBeforeEvent: number; refundPercentage: number }[];
	bookings?: BookingRow[];
	spotsFree?: number;
	tourInHours?: number;
	crashOnCompleteTimes?: number;
	failQueueInsert?: boolean;
	chargeRecorded?: boolean;
	payments?: { paymentIntentId: string | null; amount: number; fee?: number; at?: number }[];
}

export interface BookingRow {
	id: string;
	paymentIntentId: string | null;
	amount: number;
	status?: string;
	paymentMethod?: string;
	quantity?: number;
}

export interface LedgerRow {
	id: string;
	bookingId: string;
	type: string;
	amount: number;
	currency: string;
	stripePaymentIntentId: string | null;
	stripeRefundId: string | null;
	feeAmount: number | null;
	operationKey: string;
	status: string;
	reason: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export const DEFAULT_RULES = [
	{ hoursBeforeEvent: 72, refundPercentage: 100 },
	{ hoursBeforeEvent: 24, refundPercentage: 50 },
];

export function booking(over: Partial<BookingRow> & { id: string }): BookingRow {
	return { paymentIntentId: `pi_${over.id}`, amount: 20000, status: 'CONFIRMED', ...over };
}

const toNumber = (value: unknown): number => Number(String(value));

export function createWorld(world: World = {}) {
	const stripeCalls: Call[] = [];
	const ledger: { where: unknown; create: unknown; update: unknown }[] = [];
	const table: LedgerRow[] = [];
	const bookingUpdates: unknown[] = [];
	const emails: { kind: string; payload: Record<string, unknown> }[] = [];
	const refundsByKey = new Map<string, { id: string; amount: number }>();
	const rows = world.bookings ?? [booking({ id: 'b1' })];
	const occurrenceDate = new Date(Date.now() + (world.tourInHours ?? 240) * HOUR);
	let sequence = 0;
	let crashesLeft = world.crashOnCompleteTimes ?? 0;

	const fullBooking = (row: BookingRow) => ({
		id: row.id,
		userId: 'u1',
		occurrenceId: 'o1',
		status: row.status,
		quantity: row.quantity ?? 1,
		amount: row.amount,
		paymentMethod: row.paymentMethod ?? 'SITE_PAYMENT',
		paymentIntentId: row.paymentIntentId,
		referenceNumber: 42,
		brandHost: null,
		checkedInAt: null,
		user: { id: 'u1', email: 'a@x.am', name: 'Ани', locale: 'ru' },
		occurrence: {
			id: 'o1',
			date: occurrenceDate,
			maxParticipants: 10,
			currentParticipants: 10 - (world.spotsFree ?? 5),
			event: {
				cancellationRules: world.rules ?? DEFAULT_RULES,
				translations: [{ locale: 'ru', title: 'Татев' }],
			},
		},
	});

	const matches = (row: LedgerRow, where: Record<string, unknown>): boolean =>
		Object.entries(where).every(([key, value]) => {
			if (key === 'amount' && value && typeof value === 'object' && 'gt' in value) {
				return row.amount > toNumber(value.gt);
			}
			if (key === 'updatedAt') {
				if (value instanceof Date) return row.updatedAt.getTime() === value.getTime();
				return row.updatedAt.getTime() <= (value as { lte: Date }).lte.getTime();
			}
			if (key === 'stripePaymentIntentId' && value && typeof value === 'object') {
				return row.stripePaymentIntentId !== null;
			}
			if (key === 'feeAmount') return value === null ? row.feeAmount === null : true;
			return (row as unknown as Record<string, unknown>)[key] === value;
		});

	const apply = (row: LedgerRow, data: Record<string, unknown>) => {
		for (const [key, value] of Object.entries(data)) {
			if (key === 'amount' || key === 'feeAmount') {
				(row as unknown as Record<string, unknown>)[key] = toNumber(value);
			} else {
				(row as unknown as Record<string, unknown>)[key] = value;
			}
		}
		if (!('updatedAt' in data)) row.updatedAt = new Date();
	};

	const insert = (data: Record<string, unknown>): LedgerRow => {
		sequence += 1;
		const row: LedgerRow = {
			id: `adj${sequence}`,
			bookingId: data.bookingId as string,
			type: data.type as string,
			amount: toNumber(data.amount),
			currency: (data.currency as string) ?? 'AMD',
			stripePaymentIntentId: (data.stripePaymentIntentId as string | null) ?? null,
			stripeRefundId: (data.stripeRefundId as string | null) ?? null,
			feeAmount: data.feeAmount === undefined ? null : toNumber(data.feeAmount),
			operationKey: (data.operationKey as string | undefined) ?? '',
			status: data.status as string,
			reason: (data.reason as string | null) ?? null,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		table.push(row);
		return row;
	};

	for (const payment of world.payments ?? []) {
		const seeded = insert({
			bookingId: rows[0].id,
			type: 'CHARGE',
			status: 'SUCCEEDED',
			amount: payment.amount,
			stripePaymentIntentId: payment.paymentIntentId,
			feeAmount: payment.fee,
		});
		seeded.createdAt = new Date(Date.UTC(2026, 9, 1 + (payment.at ?? 1)));
	}

	const tx = {
		booking: {
			findUnique: () => Promise.resolve(fullBooking(rows[0])),
			findFirst: () => Promise.resolve(fullBooking(rows[0])),
			findMany: () => Promise.resolve(rows.map(fullBooking)),
			updateMany: (args: unknown) => {
				bookingUpdates.push({ op: 'updateMany', args });
				return Promise.resolve({ count: rows.length });
			},
			update: (args: { data: Record<string, unknown> }) => {
				bookingUpdates.push({ op: 'update', args });
				return Promise.resolve({ ...fullBooking(rows[0]), ...args.data });
			},
		},
		eventOccurrence: {
			updateMany: () => Promise.resolve({ count: (world.spotsFree ?? 5) >= 1 ? 1 : 0 }),
			update: () => Promise.resolve({}),
		},
		bookingAdjustment: {
			findFirst: () => Promise.resolve(null),
			findMany: (args: { where: Record<string, unknown> }) =>
				Promise.resolve(table.filter((row) => matches(row, args.where)).map((row) => ({ ...row }))),
			create: (args: { data: Record<string, unknown> }) => {
				ledger.push({ where: 'tx.create', create: args.data, update: null });
				insert(args.data);
				return Promise.resolve({});
			},
			createMany: (args: { data: Record<string, unknown>[]; skipDuplicates?: boolean }) => {
				if (world.failQueueInsert) return Promise.reject(new Error('database down'));
				let count = 0;
				for (const data of args.data) {
					const exists = table.some(
						(row) => row.stripePaymentIntentId === data.stripePaymentIntentId && row.type === data.type,
					);
					if (exists && args.skipDuplicates) continue;
					insert(data);
					count += 1;
				}
				return Promise.resolve({ count });
			},
		},
		bookingReference: { create: () => Promise.resolve({ id: 7 }) },
		user: { update: () => Promise.resolve({}) },
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
		booking: {
			findUnique: () => Promise.resolve(fullBooking(rows[0])),
			findMany: () => Promise.resolve(rows.map(fullBooking)),
			updateMany: () => Promise.resolve({ count: 1 }),
		},
		bookingAdjustment: {
			upsert: (args: {
				where: {
					stripePaymentIntentId_type_operationKey: {
						stripePaymentIntentId: string;
						type: string;
						operationKey: string;
					};
				};
				create: Record<string, unknown>;
				update: Record<string, unknown>;
			}) => {
				const key = args.where.stripePaymentIntentId_type_operationKey;
				const owner = rows.find((row) => row.id === args.create.bookingId);
				if (key.type === 'CHARGE' && world.chargeRecorded !== false && owner?.status === 'CONFIRMED') {
					return Promise.resolve({});
				}
				ledger.push({ where: args.where, create: args.create, update: args.update });
				const existing = table.find(
					(row) =>
						row.stripePaymentIntentId === key.stripePaymentIntentId &&
						row.type === key.type &&
						row.operationKey === key.operationKey,
				);
				if (existing) apply(existing, args.update);
				else insert(args.create);
				return Promise.resolve({});
			},
			updateMany: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
				if (args.where.type === 'CHARGE') {
					ledger.push({ where: 'updateMany', create: args, update: null });
					return Promise.resolve({ count: 1 });
				}

				if (args.data.status === 'SUCCEEDED' && crashesLeft > 0) {
					crashesLeft -= 1;
					return Promise.reject(new Error('process died while writing the ledger'));
				}

				const matched = table.filter((row) => matches(row, args.where));
				matched.forEach((row) => apply(row, args.data));
				return Promise.resolve({ count: matched.length });
			},
			deleteMany: (args: { where: Record<string, unknown> }) => {
				const matched = table.filter((row) => matches(row, args.where));
				for (const row of matched) table.splice(table.indexOf(row), 1);
				return Promise.resolve({ count: matched.length });
			},
			findMany: (args: { where: Record<string, unknown>; take?: number }) =>
				Promise.resolve(
					table
						.filter((row) => matches(row, args.where))
						.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
						.slice(0, args.take ?? 100)
						.map((row) => ({ ...row })),
				),
		},
	};

	const stripe = {
		retrievePaymentIntent: (id: string) => {
			stripeCalls.push({ method: 'retrievePaymentIntent', args: [id] });
			return Promise.resolve({
				id,
				status: world.intentStatus ?? 'succeeded',
				amount: 2000000,
				amount_received: 2000000,
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
			const known = refundsByKey.get(key);
			if (known) return Promise.resolve(known);
			const created = { id: `re_${pi}`, amount };
			refundsByKey.set(key, created);
			return Promise.resolve(created);
		},
		cancelPaymentIntent: (pi: string, key?: string) => {
			stripeCalls.push({ method: 'cancelPaymentIntent', args: [pi, key] });
			return Promise.resolve({});
		},
	};

	const mail = {
		sendBookingConfirmation: (payload: Record<string, unknown>) => {
			emails.push({ kind: 'confirmation', payload });
			return Promise.resolve(true);
		},
		sendBookingCancelledEmail: (payload: Record<string, unknown>) => {
			emails.push({ kind: 'cancelled', payload });
			return Promise.resolve(true);
		},
	};

	const kit = createBookingKit(prisma as never, stripe as never, mail as never);

	return {
		service: kit.service,
		refunds: kit.refunds,
		stripeCalls,
		ledger,
		table,
		bookingUpdates,
		emails,
		moneyMoved: () => refundsByKey.size,
		prisma: prisma as never,
		stripe: stripe as never,
	};
}

export const refundCalls = (calls: Call[]) => calls.filter((call) => call.method === 'refund');
export const cancelCalls = (calls: Call[]) =>
	calls.filter((call) => call.method === 'cancelPaymentIntent');
