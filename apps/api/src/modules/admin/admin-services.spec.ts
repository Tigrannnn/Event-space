import { endOfDay, startOfDay } from '../../shared/utils/app-day.util';
import { createAdmin, fakePrisma, fakeStripe } from './admin.test-helpers';

const HOUR = 60 * 60 * 1000;
const anyDate = (): Date => expect.any(Date) as Date;
const UUID = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b';

const RULES = [
	{ hoursBeforeEvent: 72, refundPercentage: 100 },
	{ hoursBeforeEvent: 24, refundPercentage: 50 },
];

function bookingRow(over: Record<string, unknown> = {}) {
	return {
		id: 'b1',
		userId: 'u1',
		occurrenceId: 'o1',
		status: 'CONFIRMED',
		quantity: 2,
		amount: '20000',
		paymentIntentId: 'pi_1',
		checkedInAt: null,
		occurrence: {
			id: 'o1',
			date: new Date(Date.now() + 10 * 24 * HOUR),
			maxParticipants: 10,
			currentParticipants: 4,
			event: {
				id: 'e1',
				price: '10000',
				cancellationRules: RULES,
				translations: [],
			},
		},
		adjustments: [{ id: 'a1', amount: '20000' }],
		...over,
	};
}

type RefundSource = ((name: string) => unknown[]) | { name: string; args: unknown }[];

const refundUpserts = (source: RefundSource) =>
	(typeof source === 'function'
		? source('bookingAdjustment.upsert')
		: source.filter((call) => call.name === 'bookingAdjustment.upsert').map((call) => call.args)
	).filter(
		(args) =>
			(args as { where?: { stripePaymentIntentId_type_operationKey?: { type?: string } } }).where
				?.stripePaymentIntentId_type_operationKey?.type === 'REFUND',
	);

describe('admin: users', () => {
	it('lists without filters, newest first, asking for one extra row', async () => {
		const { prisma, argsOf } = fakePrisma({ 'user.findMany': [{ id: 'u1' }], 'user.count': 1 });
		const result = await createAdmin(prisma, fakeStripe().stripe).findAllUsers();

		expect(argsOf('user.findMany')[0]).toMatchObject({
			where: {},
			skip: 0,
			take: 21,
			orderBy: { createdAt: 'desc' },
		});
		expect(result).toEqual({
			data: [{ id: 'u1' }],
			total: 1,
			skip: 0,
			take: 20,
			hasMore: false,
			nextSkip: null,
		});
	});

	it('reports a next page when the extra row came back', async () => {
		const rows = Array.from({ length: 21 }, (_, index) => ({ id: `u${index}` }));
		const { prisma } = fakePrisma({ 'user.findMany': rows, 'user.count': 50 });
		const result = await createAdmin(prisma, fakeStripe().stripe).findAllUsers({ skip: 20 });

		expect(result.data).toHaveLength(20);
		expect(result).toMatchObject({ hasMore: true, nextSkip: 40, total: 50, skip: 20 });
	});

	it('builds the filter from every field', async () => {
		const { prisma, argsOf } = fakePrisma();
		await createAdmin(prisma, fakeStripe().stripe).findAllUsers({
			search: UUID,
			role: 'ADMIN',
			emailVerified: false,
			isShadow: true,
			createdFrom: '2026-10-01',
			createdTo: '2026-10-05',
		});

		expect(argsOf('user.findMany')[0]).toMatchObject({
			where: {
				OR: [
					{ id: UUID },
					{ name: { contains: UUID, mode: 'insensitive' } },
					{ email: { contains: UUID, mode: 'insensitive' } },
				],
				role: 'ADMIN',
				emailVerified: false,
				isShadow: true,
				createdAt: {
					gte: new Date('2026-10-01T00:00:00.000+04:00'),
					lte: new Date('2026-10-05T23:59:59.999+04:00'),
				},
			},
		});
	});

	it('does not search by id for plain text', async () => {
		const { prisma, argsOf } = fakePrisma();
		await createAdmin(prisma, fakeStripe().stripe).findAllUsers({ search: 'ани' });

		expect(argsOf('user.findMany')[0]).toMatchObject({
			where: {
				OR: [
					{ name: { contains: 'ани', mode: 'insensitive' } },
					{ email: { contains: 'ани', mode: 'insensitive' } },
				],
			},
		});
	});

	it('changes a role and never selects secrets', async () => {
		const { prisma, argsOf } = fakePrisma({
			'user.findUnique': { emailVerified: true, isShadow: false },
			'user.update': { id: 'u1', role: 'ADMIN' },
		});
		await createAdmin(prisma, fakeStripe().stripe).updateUserRole('u1', 'ADMIN');

		const args = argsOf('user.update')[0];
		expect(args).toMatchObject({ where: { id: 'u1' }, data: { role: 'ADMIN' } });
		expect(JSON.stringify(args)).not.toContain('password');
	});

	it('refuses to change the role of the admin doing it', async () => {
		const { prisma, argsOf } = fakePrisma({
			'user.findUnique': { emailVerified: true, isShadow: false },
			'user.update': { id: 'admin-1', role: 'USER' },
		});

		await expect(
			createAdmin(prisma, fakeStripe().stripe).updateUserRole('admin-1', 'USER'),
		).rejects.toMatchObject({ code: 'CANNOT_CHANGE_OWN_ROLE' });
		expect(argsOf('user.update')).toHaveLength(0);
	});

	it('refuses to make an admin out of an account nobody confirmed', async () => {
		for (const user of [
			{ emailVerified: false, isShadow: false },
			{ emailVerified: true, isShadow: true },
		]) {
			const { prisma, argsOf } = fakePrisma({
				'user.findUnique': user,
				'user.update': { id: 'u1', role: 'ADMIN' },
			});

			await expect(
				createAdmin(prisma, fakeStripe().stripe).updateUserRole('u1', 'ADMIN'),
			).rejects.toMatchObject({ code: 'CANNOT_PROMOTE_UNVERIFIED' });
			expect(argsOf('user.update')).toHaveLength(0);
		}
	});

	it('still lets an unconfirmed admin be demoted', async () => {
		const { prisma, argsOf } = fakePrisma({
			'user.findUnique': { emailVerified: false, isShadow: true },
			'user.update': { id: 'u1', role: 'USER' },
		});

		await createAdmin(prisma, fakeStripe().stripe).updateUserRole('u1', 'USER');
		expect(argsOf('user.update')[0]).toMatchObject({ data: { role: 'USER' } });
	});
});

describe('admin: reading bookings', () => {
	it('turns decimals into numbers', async () => {
		const { prisma } = fakePrisma({ 'booking.findUnique': bookingRow() });
		const booking = await createAdmin(prisma, fakeStripe().stripe).findOneBooking('b1');

		expect(booking).toMatchObject({
			amount: 20000,
			event: { price: 10000 },
			occurrence: { event: { price: 10000 } },
			adjustments: [{ id: 'a1', amount: 20000 }],
		});
	});

	it('returns null for an unknown booking, and throws by reference', async () => {
		const { prisma } = fakePrisma({ 'booking.findUnique': null });
		const admin = createAdmin(prisma, fakeStripe().stripe);

		await expect(admin.findOneBooking('nope')).resolves.toBeNull();
		await expect(admin.findBookingByReference(99)).rejects.toBeDefined();
	});

	it('maps display statuses onto columns', async () => {
		const run = async (status: 'CHECKED_IN' | 'CONFIRMED' | 'CANCELLED') => {
			const { prisma, argsOf } = fakePrisma();
			await createAdmin(prisma, fakeStripe().stripe).findAllBookings({ status });
			return (argsOf('booking.findMany')[0] as { where: unknown }).where;
		};

		await expect(run('CHECKED_IN')).resolves.toEqual({
			status: 'CONFIRMED',
			checkedInAt: { not: null },
		});
		await expect(run('CONFIRMED')).resolves.toEqual({ status: 'CONFIRMED', checkedInAt: null });
		await expect(run('CANCELLED')).resolves.toEqual({ status: 'CANCELLED' });
	});

	it('merges time, tour range and event into one occurrence condition', async () => {
		const { prisma, argsOf } = fakePrisma();
		await createAdmin(prisma, fakeStripe().stripe).findAllBookings({
			time: 'upcoming',
			tourFrom: '2026-11-01',
			tourTo: '2026-11-30',
			eventId: 'e1',
			occurrenceId: 'o1',
			paymentMethod: 'OFFLINE_PAID',
			createdFrom: '2026-10-01',
		});

		expect(argsOf('booking.findMany')[0]).toMatchObject({
			where: {
				occurrenceId: 'o1',
				paymentMethod: 'OFFLINE_PAID',
				createdAt: { gte: new Date('2026-10-01T00:00:00.000+04:00') },
				occurrence: {
					AND: [
						{ date: { gte: anyDate() } },
						{
							date: {
								gte: new Date('2026-11-01T00:00:00.000+04:00'),
								lte: new Date('2026-11-30T23:59:59.999+04:00'),
							},
						},
					],
					eventId: 'e1',
				},
			},
			orderBy: { createdAt: 'desc' },
		});
	});

	it('searches by id, guest and event text', async () => {
		const { prisma, argsOf } = fakePrisma();
		await createAdmin(prisma, fakeStripe().stripe).findAllBookings({ search: UUID });

		const where = (argsOf('booking.findMany')[0] as { where: { OR: unknown[] } }).where;
		expect(where.OR).toHaveLength(4);
		expect(where.OR[0]).toEqual({ id: UUID });
	});

	it('normalises the page it returns', async () => {
		const { prisma } = fakePrisma({ 'booking.findMany': [bookingRow()], 'booking.count': 1 });
		const result = await createAdmin(prisma, fakeStripe().stripe).findAllBookings();

		expect(result).toMatchObject({
			total: 1,
			hasMore: false,
			data: [{ id: 'b1', amount: 20000 }],
		});
	});
});

describe('admin: check-in', () => {
	it('checks a confirmed guest in once', async () => {
		const ok = fakePrisma({ 'booking.findUnique': bookingRow(), 'booking.update': bookingRow() });
		await createAdmin(ok.prisma, fakeStripe().stripe).checkInBooking('b1');
		expect(ok.argsOf('booking.update')[0]).toMatchObject({
			where: { id: 'b1' },
			data: { checkedInAt: anyDate() },
		});

		const again = fakePrisma({ 'booking.findUnique': bookingRow({ checkedInAt: new Date() }) });
		await expect(
			createAdmin(again.prisma, fakeStripe().stripe).checkInBooking('b1'),
		).rejects.toBeDefined();

		const pending = fakePrisma({ 'booking.findUnique': bookingRow({ status: 'PENDING' }) });
		await expect(
			createAdmin(pending.prisma, fakeStripe().stripe).checkInBooking('b1'),
		).rejects.toBeDefined();

		const missing = fakePrisma({ 'booking.findUnique': null });
		await expect(
			createAdmin(missing.prisma, fakeStripe().stripe).checkInBooking('b1'),
		).rejects.toBeDefined();
	});

	it('undoes a check-in made by mistake, so the guest is confirmed again', async () => {
		const world = fakePrisma({
			'booking.findUnique': bookingRow({ checkedInAt: new Date() }),
			'booking.update': bookingRow(),
		});
		await createAdmin(world.prisma, fakeStripe().stripe).undoBookingCheckIn('b1');

		expect(world.argsOf('booking.update')[0]).toMatchObject({
			where: { id: 'b1' },
			data: { checkedInAt: null },
		});
	});

	it('refuses to undo a check-in that was never made', async () => {
		const world = fakePrisma({ 'booking.findUnique': bookingRow() });
		await expect(
			createAdmin(world.prisma, fakeStripe().stripe).undoBookingCheckIn('b1'),
		).rejects.toMatchObject({ code: 'NOT_CHECKED_IN' });
		expect(world.argsOf('booking.update')).toHaveLength(0);
	});
});

describe('admin: cancelling a booking with money', () => {
	const charge = (over: Record<string, unknown> = {}) => ({
		type: 'CHARGE',
		status: 'SUCCEEDED',
		amount: '20000',
		stripePaymentIntentId: 'pi_1',
		feeAmount: '900',
		operationKey: '',
		createdAt: new Date('2026-10-01T00:00:00Z'),
		...over,
	});

	const soonTour = (hours: number) => ({
		occurrence: {
			id: 'o1',
			date: new Date(Date.now() + hours * HOUR),
			event: { id: 'e1', price: '10000', cancellationRules: RULES, translations: [] },
		},
	});

	const setup = (
		bookingOver: Record<string, unknown> = {},
		options: {
			ledger?: unknown[];
			stripe?: { intentStatus?: string; fails?: boolean; fee?: number };
			results?: Record<string, unknown>;
		} = {},
	) => {
		const row = bookingRow({ status: 'CONFIRMED', ...bookingOver });
		const ledger = options.ledger ?? [charge()];
		const world = fakePrisma({
			'booking.findUnique': row,
			'booking.update': { ...row, status: 'CANCELLED' },
			'bookingAdjustment.findMany': (args: { where?: { feeAmount?: unknown } }) =>
				args?.where?.feeAmount === null ? [] : ledger,
			...options.results,
		});
		const stripe = fakeStripe(options.stripe);
		return {
			...world,
			stripeCalls: stripe.calls,
			refundsAt: () => stripe.calls.filter((call) => call.name === 'refund').map((call) => call.args),
			admin: createAdmin(world.prisma, stripe.stripe),
		};
	};

	const queuedAmounts = (argsOf: (name: string) => unknown[]) =>
		argsOf('bookingAdjustment.createMany').flatMap((args) =>
			(args as { data: { amount: { toString(): string }; operationKey: string }[] }).data.map(
				(row) => [row.operationKey, row.amount.toString()],
			),
		);

	it('cancels without money when nothing was paid', async () => {
		const { admin, stripeCalls, calls } = setup(
			{ paymentIntentId: null, paymentMethod: 'PAY_ON_ARRIVAL' },
			{ ledger: [] },
		);
		const result = await admin.adminCancelBooking('a1', 'b1', { refundType: 'RULES' });

		expect(result).toMatchObject({
			processed: false,
			message: 'Booking cancelled without payment refund processing.',
			booking: { status: 'CANCELLED', amount: 20000 },
		});
		expect(stripeCalls).toHaveLength(0);
		expect(calls.some((call) => call.name.startsWith('bookingAdjustment.create'))).toBe(false);
	});

	it('frees the seats of a confirmed booking', async () => {
		const { admin, argsOf } = setup({ paymentIntentId: null }, { ledger: [] });
		await admin.adminCancelBooking('a1', 'b1', { refundType: 'RULES' });

		expect(argsOf('eventOccurrence.updateMany')[0]).toEqual({
			where: { id: 'o1', currentParticipants: { gte: 2 } },
			data: { currentParticipants: { decrement: 2 } },
		});
	});

	it('refunds by the rules through Stripe, minus the card fee', async () => {
		const { admin, refundsAt, argsOf } = setup();
		const result = await admin.adminCancelBooking('a1', 'b1', {
			refundType: 'RULES',
			reason: 'болезнь',
		});

		expect(refundsAt()).toEqual([['pi_1', 'cancel:b1:pi_1', 1910000]]);
		expect(queuedAmounts(argsOf)).toEqual([['cancel:b1', '19100']]);
		expect(result).toMatchObject({
			processed: true,
			refundMethod: 'STRIPE',
			message: 'Booking cancelled and refund processed according to cancellation rules.',
		});
	});

	it('refunds only the rule share when the tour is close', async () => {
		const { admin, refundsAt } = setup(soonTour(30));
		await admin.adminCancelBooking('a1', 'b1', { refundType: 'RULES' });

		expect(refundsAt()).toEqual([['pi_1', 'cancel:b1:pi_1', 910000]]);
	});

	it('refunds in full, fee included, regardless of the rules', async () => {
		const { admin, refundsAt } = setup(soonTour(2));
		const result = await admin.adminCancelBooking('a1', 'b1', { refundType: 'FULL' });

		expect(refundsAt()).toEqual([['pi_1', 'cancel:b1:pi_1', 2000000]]);
		expect(result).toMatchObject({ message: 'Booking cancelled and refund processed.' });
	});

	it('records a refund the admin made by hand without calling Stripe', async () => {
		const { admin, refundsAt, argsOf } = setup();
		const result = await admin.adminCancelBooking('a1', 'b1', {
			refundType: 'RULES',
			refundMethod: 'MANUAL',
			reason: 'вернули наличными',
		});

		expect(refundsAt()).toHaveLength(0);
		const manual = refundUpserts(argsOf)[0] as {
			create: { status: string; amount: { toString(): string }; reason: string };
		};
		expect(manual.create).toMatchObject({ status: 'SUCCEEDED' });
		expect(manual.create.amount.toString()).toBe('19100');
		expect(manual.create.reason).toBe(
			'Refunded by an admin outside Stripe: Admin a1 cancelled the booking: вернули наличными',
		);
		expect(result).toMatchObject({ processed: true, refundMethod: 'MANUAL' });
		expect(result.message).toContain('191');
	});

	it('records a booking paid in person as refunded by hand, without a card fee', async () => {
		const { admin, stripeCalls, argsOf } = setup(
			{ paymentIntentId: null, paymentMethod: 'OFFLINE_PAID' },
			{ ledger: [charge({ stripePaymentIntentId: null, feeAmount: null })] },
		);
		const result = await admin.adminCancelBooking('a1', 'b1', { refundType: 'RULES' });

		expect(stripeCalls).toHaveLength(0);
		const cash = argsOf('bookingAdjustment.create')[0] as {
			data: { status: string; stripePaymentIntentId: null; amount: { toString(): string } };
		};
		expect(cash.data).toMatchObject({ status: 'SUCCEEDED', stripePaymentIntentId: null });
		expect(cash.data.amount.toString()).toBe('20000');
		expect(result).toMatchObject({ refundMethod: 'MANUAL' });
	});

	it('explains a cancellation whose whole rule refund the card fee covers', async () => {
		const { admin, refundsAt } = setup(
			{ amount: '1000', ...soonTour(30) },
			{ ledger: [charge({ amount: '1000', feeAmount: '900' })] },
		);
		const result = await admin.adminCancelBooking('a1', 'b1', { refundType: 'RULES' });

		expect(refundsAt()).toHaveLength(0);
		expect(result).toMatchObject({ processed: true });
		expect(result.message).toContain('covered entirely by the payment provider fee');
	});

	it('keeps the refund queued for a retry when Stripe refuses', async () => {
		const { admin, argsOf } = setup({}, { stripe: { fails: true } });
		const result = await admin.adminCancelBooking('a1', 'b1', { refundType: 'RULES' });

		expect(queuedAmounts(argsOf)).toEqual([['cancel:b1', '19100']]);
		expect(result).toMatchObject({ processed: true });
	});

	it('cancels a payment intent that was never paid', async () => {
		const { admin, stripeCalls, refundsAt } = setup(
			{},
			{ ledger: [], stripe: { intentStatus: 'requires_payment_method' } },
		);
		const result = await admin.adminCancelBooking('a1', 'b1', { refundType: 'RULES' });

		expect(stripeCalls.some((call) => call.name === 'cancelPaymentIntent')).toBe(true);
		expect(refundsAt()).toHaveLength(0);
		expect(result).toMatchObject({ processed: false });
	});

	describe('cancelling a booking that is already cancelled', () => {
		it('does not refund a second time', async () => {
			const { admin, refundsAt, calls } = setup(
				{ status: 'CANCELLED' },
				{ results: { 'bookingAdjustment.findFirst': { id: 'adj1' } } },
			);
			const result = await admin.adminCancelBooking('a1', 'b1', { refundType: 'RULES' });

			expect(refundsAt()).toHaveLength(0);
			expect(calls.some((call) => call.name === 'eventOccurrence.updateMany')).toBe(false);
			expect(result).toMatchObject({
				processed: false,
				message: 'Booking was already cancelled and its refund is recorded.',
			});
		});

		it('still finishes a cancellation whose refund never happened', async () => {
			const { admin, refundsAt } = setup({ status: 'CANCELLED' });
			await admin.adminCancelBooking('a1', 'b1', { refundType: 'RULES' });

			expect(refundsAt()).toHaveLength(1);
		});
	});

	it('refuses an unknown booking', async () => {
		const { prisma } = fakePrisma({ 'booking.findUnique': null });
		await expect(
			createAdmin(prisma, fakeStripe().stripe).adminCancelBooking('a1', 'nope', {
				refundType: 'RULES',
			}),
		).rejects.toBeDefined();
	});
});

describe('admin: events list', () => {
	const whereOf = async (params: Record<string, unknown>) => {
		const { prisma, argsOf } = fakePrisma();
		await createAdmin(prisma, fakeStripe().stripe).findAllEvents(params);
		return (argsOf('event.findMany')[0] as { where: unknown }).where;
	};

	it('has no condition without filters', async () => {
		await expect(whereOf({})).resolves.toEqual({});
	});

	it('filters by plain columns and price bounds together', async () => {
		await expect(
			whereOf({
				status: 'PUBLISHED',
				difficulty: 'EASY',
				category: 'hiking',
				minPrice: 1000,
				maxPrice: 5000,
			}),
		).resolves.toEqual({
			status: 'PUBLISHED',
			difficulty: 'EASY',
			category: { slug: 'hiking' },
			price: { gte: 1000, lte: 5000 },
		});
	});

	it('treats upcoming as an active future date', async () => {
		await expect(whereOf({ time: 'upcoming' })).resolves.toEqual({
			occurrences: { some: { date: { gte: anyDate() }, status: 'ACTIVE' } },
		});
	});

	it('treats completed as a past date and no future one', async () => {
		await expect(whereOf({ time: 'completed' })).resolves.toEqual({
			occurrences: { some: { date: { lt: anyDate() } } },
			NOT: [{ occurrences: { some: { date: { gte: anyDate() }, status: 'ACTIVE' } } }],
		});
	});

	it('keeps the stricter lower bound when the range starts later than today', async () => {
		const where = (await whereOf({ time: 'upcoming', startDate: '2099-01-01' })) as {
			occurrences: { some: { date: { gte: Date } } };
		};

		expect(where.occurrences.some.date.gte.toISOString()).toBe('2098-12-31T20:00:00.000Z');
	});

	it('reads the date range as whole Yerevan days', async () => {
		await expect(whereOf({ startDate: '2026-10-01', endDate: '2026-10-05' })).resolves.toEqual({
			occurrences: {
				some: {
					date: {
						gte: new Date('2026-09-30T20:00:00.000Z'),
						lte: new Date('2026-10-05T19:59:59.999Z'),
					},
				},
			},
		});
	});

	it('matches free, empty and sold-out dates on the same date row', async () => {
		await expect(whereOf({ spots: 'available' })).resolves.toEqual({
			occurrences: { some: { status: 'ACTIVE', currentParticipants: { lt: '__max__' } } },
		});
		await expect(whereOf({ spots: 'empty' })).resolves.toEqual({
			occurrences: { some: { status: 'ACTIVE', currentParticipants: 0 } },
		});
		await expect(whereOf({ spots: 'full' })).resolves.toEqual({
			occurrences: { some: { status: 'ACTIVE' } },
			NOT: [{ occurrences: { some: { status: 'ACTIVE', currentParticipants: { lt: '__max__' } } } }],
		});
	});

	it('searches titles, descriptions and places, and the id for a uuid', async () => {
		const where = (await whereOf({ search: UUID })) as { OR: unknown[] };

		expect(where.OR[0]).toEqual({ id: UUID });
		expect(JSON.stringify(where.OR[1])).toContain('description');
	});

	it('attaches booking counts per date and for the whole event', async () => {
		const { prisma } = fakePrisma({
			'event.findMany': [
				{ id: 'e1', occurrences: [{ id: 'o1' }, { id: 'o2' }] },
				{ id: 'e2', occurrences: [{ id: 'o3' }] },
			],
			'event.count': 2,
			'booking.groupBy': (args: unknown) =>
				JSON.stringify(args).includes('checkedInAt')
					? [{ occurrenceId: 'o1', _count: { _all: 1 } }]
					: [
							{ occurrenceId: 'o1', status: 'CONFIRMED', _count: { _all: 3 } },
							{ occurrenceId: 'o1', status: 'CANCELLED', _count: { _all: 1 } },
							{ occurrenceId: 'o2', status: 'PENDING', _count: { _all: 2 } },
						],
		});
		const result = await createAdmin(prisma, fakeStripe().stripe).findAllEvents();

		expect(result.data[0]).toMatchObject({
			bookingStats: { total: 6, confirmed: 3, cancelled: 1, pending: 2, checkedIn: 1 },
			occurrences: [
				{ id: 'o1', bookingStats: { total: 4, confirmed: 3, cancelled: 1, checkedIn: 1 } },
				{ id: 'o2', bookingStats: { total: 2, pending: 2 } },
			],
		});
		expect(result.data[1]).toMatchObject({
			bookingStats: { total: 0 },
			occurrences: [{ id: 'o3', bookingStats: { total: 0 } }],
		});
	});

	it('skips the stats queries for an empty page', async () => {
		const { prisma, calls } = fakePrisma();
		await createAdmin(prisma, fakeStripe().stripe).findAllEvents();

		expect(calls.some((call) => call.name === 'booking.groupBy')).toBe(false);
	});
});

describe('admin: categories', () => {
	it('searches names, and ids for a uuid', async () => {
		const { prisma, argsOf } = fakePrisma();
		await createAdmin(prisma, fakeStripe().stripe).findAllCategories({ search: UUID });

		expect(argsOf('category.findMany')[0]).toMatchObject({
			where: {
				OR: [
					{ id: UUID },
					{ translations: { some: { name: { contains: UUID, mode: 'insensitive' } } } },
				],
			},
			take: 21,
			orderBy: { createdAt: 'desc' },
		});
	});

	it('creates with its translations', async () => {
		const { prisma, argsOf } = fakePrisma();
		await createAdmin(prisma, fakeStripe().stripe).createCategory({
			slug: 'hiking',
			translations: [{ locale: 'ru', name: 'Походы' }],
		} as never);

		expect(argsOf('category.create')[0]).toEqual({
			data: { slug: 'hiking', translations: { create: [{ locale: 'ru', name: 'Походы' }] } },
			include: { translations: true },
		});
	});

	it('replaces translations only when they are sent', async () => {
		const { prisma, argsOf } = fakePrisma();
		const admin = createAdmin(prisma, fakeStripe().stripe);

		await admin.updateCategory('c1', {
			slug: 'new',
			translations: [{ locale: 'ru', name: 'Новое' }],
		} as never);
		await admin.updateCategory('c1', { slug: 'only-slug' });

		expect(argsOf('category.update')[0]).toMatchObject({
			where: { id: 'c1' },
			data: {
				slug: 'new',
				translations: { deleteMany: {}, create: [{ locale: 'ru', name: 'Новое' }] },
			},
		});
		expect((argsOf('category.update')[1] as { data: object }).data).toEqual({ slug: 'only-slug' });
	});

	it('deletes with translations and reads one by id', async () => {
		const { prisma, argsOf } = fakePrisma();
		const admin = createAdmin(prisma, fakeStripe().stripe);
		await admin.deleteCategory('c1');
		await admin.findOneCategory('c1');

		expect(argsOf('category.delete')[0]).toEqual({
			where: { id: 'c1' },
			include: { translations: true },
		});
		expect(argsOf('category.findUnique')[0]).toEqual({
			where: { id: 'c1' },
			include: { translations: true },
		});
	});
});

describe('admin: dashboard stats', () => {
	it('assembles counters, attention queues and capacity', async () => {
		const { prisma } = fakePrisma({
			'event.count': (args: unknown) => {
				const text = JSON.stringify(args ?? {});
				if (text.includes('PUBLISHED')) return 6;
				if (text.includes('DRAFT')) return 3;
				if (text.includes('CANCELLED')) return 1;
				if (text.includes('lte')) return 4;
				if (text.includes('gte')) return 5;
				return 10;
			},
			'user.count': (args: unknown) => (JSON.stringify(args ?? {}).includes('emailVerified') ? 2 : 7),
			'booking.count': (args: unknown) => {
				const text = JSON.stringify(args ?? {});
				if (text.includes('CONFIRMED')) return 20;
				if (text.includes('PENDING')) return 5;
				if (text.includes('CANCELLED')) return 4;
				return 29;
			},
			'eventOccurrence.aggregate': {
				_sum: { maxParticipants: 80, currentParticipants: 20 },
			},
			'booking.findMany': [bookingRow()],
			'event.findMany': [{ id: 'e1', price: '15000', cancellationRules: null, occurrences: null }],
		});
		const stats = await createAdmin(prisma, fakeStripe().stripe).getDashboardStats();

		expect(stats).toMatchObject({
			totalEvents: 10,
			totalUsers: 7,
			totalBookings: 29,
			confirmedBookings: 20,
			pendingBookings: 5,
			cancelledBookings: 4,
			capacityUsageRate: 25,
			totalCapacity: 80,
			usedCapacity: 20,
			events: { published: 6, draft: 3, cancelled: 1, upcoming: 5 },
			attention: { pendingBookings: 5, draftEvents: 3, eventsThisWeek: 4, pendingUsers: 2 },
		});
		expect(stats.recentBookings[0]).toMatchObject({ amount: 20000 });
		expect(stats.recentEvents[0]).toMatchObject({
			price: 15000,
			cancellationRules: [],
			occurrences: [],
		});
		expect(stats.upcomingEvents).toHaveLength(1);
	});

	it('counts events this week over seven whole days starting today', async () => {
		jest.useFakeTimers().setSystemTime(new Date('2026-10-19T10:00:00Z'));
		try {
			const { prisma, argsOf } = fakePrisma();
			await createAdmin(prisma, fakeStripe().stripe).getDashboardStats();

			const week = argsOf('event.count').find((args) =>
				JSON.stringify(args ?? {}).includes('lte'),
			) as {
				where: { occurrences: { some: { date: { gte: Date; lte: Date } } } };
			};

			expect(week.where.occurrences.some.date.gte).toEqual(startOfDay('2026-10-19'));
			expect(week.where.occurrences.some.date.lte).toEqual(endOfDay('2026-10-25'));
		} finally {
			jest.useRealTimers();
		}
	});

	it('counts only users who have not confirmed their email, not shadow guests', async () => {
		const { prisma, argsOf } = fakePrisma();
		await createAdmin(prisma, fakeStripe().stripe).getDashboardStats();

		expect(argsOf('user.count')).toContainEqual({
			where: { emailVerified: false, isShadow: false },
		});
	});

	it('shows fifteen recent bookings, users and events', async () => {
		const { prisma, argsOf } = fakePrisma();
		await createAdmin(prisma, fakeStripe().stripe).getDashboardStats();

		const takes = ['booking.findMany', 'user.findMany'].map(
			(name) => (argsOf(name)[0] as { take: number }).take,
		);
		expect(takes).toEqual([15, 15]);
		expect(argsOf('event.findMany').map((args) => (args as { take: number }).take)).toEqual([15, 5]);
	});

	it('reports zero usage when there is no capacity', async () => {
		const { prisma } = fakePrisma();
		const stats = await createAdmin(prisma, fakeStripe().stripe).getDashboardStats();

		expect(stats).toMatchObject({ capacityUsageRate: 0, totalCapacity: 0, usedCapacity: 0 });
	});
});
