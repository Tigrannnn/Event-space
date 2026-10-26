import { BookingLedgerService } from '@modules/booking/money/booking-ledger.service';
import { BookingRefundService } from '@modules/booking/money/booking-refund.service';
import { AdminUsersService } from './users/admin-users.service';
import { AdminBookingsService } from './bookings/admin-bookings.service';
import { AdminBookingCancellationService } from './bookings/admin-booking-cancellation.service';
import { AdminEventsService } from './events/admin-events.service';
import { AdminCategoriesService } from './categories/admin-categories.service';
import { DashboardStatsService } from './dashboard/dashboard-stats.service';
import type { Page } from './common/query-helpers';

export interface FakeCall {
	name: string;
	args: unknown;
}

const DEFAULTS: Record<string, unknown> = {
	count: 0,
	findMany: [],
	groupBy: [],
	aggregate: { _sum: {} },
	updateMany: { count: 1 },
};

export function fakePrisma(results: Record<string, unknown> = {}) {
	const calls: FakeCall[] = [];

	const model = (modelName: string) =>
		new Proxy(
			{},
			{
				get: (_target, method) => {
					if (method === 'fields') return { maxParticipants: '__max__' };
					if (method === 'then') return undefined;

					return (args: unknown) => {
						const name = `${modelName}.${String(method)}`;
						calls.push({ name, args });
						const configured = results[name];
						const value =
							typeof configured === 'function'
								? (configured as (a: unknown) => unknown)(args)
								: name in results
									? configured
									: (DEFAULTS[String(method)] ?? null);
						return Promise.resolve(value);
					};
				},
			},
		);

	const root: unknown = new Proxy(
		{},
		{
			get: (_target, key) => {
				if (key === '$transaction') {
					return (fn: (tx: unknown) => unknown) => fn(root);
				}
				return model(String(key));
			},
		},
	);

	const argsOf = (name: string): unknown[] =>
		calls.filter((call) => call.name === name).map((call) => call.args);

	return { prisma: root as never, calls, argsOf };
}

export function fakeStripe(options: { intentStatus?: string; fails?: boolean; fee?: number } = {}) {
	const calls: FakeCall[] = [];

	const stripe = {
		retrievePaymentIntent: (id: string) => {
			calls.push({ name: 'retrievePaymentIntent', args: [id] });
			return Promise.resolve({
				id,
				status: options.intentStatus ?? 'succeeded',
				amount: 2000000,
				amount_received: 2000000,
				latest_charge: 'ch_1',
			});
		},
		getCharge: (id: string) => {
			calls.push({ name: 'getCharge', args: [id] });
			return Promise.resolve({ balance_transaction: { fee: options.fee ?? 90000 } });
		},
		refund: (...args: unknown[]) => {
			calls.push({ name: 'refund', args });
			if (options.fails) return Promise.reject(new Error('stripe down'));
			return Promise.resolve({ id: 're_1', amount: args[2] as number });
		},
		cancelPaymentIntent: (...args: unknown[]) => {
			calls.push({ name: 'cancelPaymentIntent', args });
			return Promise.resolve({});
		},
	};

	return { stripe: stripe as never, calls };
}

export type { Page };

/** The admin services wired together the way the module wires them. */
export function createAdmin(prisma: never, stripe: never) {
	const users = new AdminUsersService(prisma);
	const bookings = new AdminBookingsService(prisma);
	const cancellation = new AdminBookingCancellationService(
		prisma,
		stripe,
		new BookingLedgerService(prisma),
		new BookingRefundService(stripe, new BookingLedgerService(prisma)),
	);
	const events = new AdminEventsService(prisma);
	const categories = new AdminCategoriesService(prisma);
	const stats = new DashboardStatsService(prisma);

	return {
		getDashboardStats: () => stats.getStats(),
		findAllUsers: (params?: Parameters<AdminUsersService['findAll']>[0]) => users.findAll(params),
		findOneUser: (id: string) => users.findOne(id),
		updateUserRole: (
			id: string,
			role: Parameters<AdminUsersService['updateRole']>[2],
			adminId = 'admin-1',
		) => users.updateRole(adminId, id, role),
		findOneBooking: (id: string) => bookings.findOne(id),
		findBookingByReference: (reference: number) => bookings.findByReference(reference),
		findAllBookings: (params?: Parameters<AdminBookingsService['findAll']>[0]) =>
			bookings.findAll(params),
		checkInBooking: (id: string) => bookings.checkIn(id, 'admin-1'),
		undoBookingCheckIn: (id: string) => bookings.undoCheckIn(id, 'admin-1'),
		adminCancelBooking: (
			adminId: string,
			id: string,
			data: Parameters<AdminBookingCancellationService['cancel']>[2],
		) => cancellation.cancel(adminId, id, data),
		findAllEvents: (params?: Parameters<AdminEventsService['findAll']>[0]) => events.findAll(params),
		findOneCategory: (id: string) => categories.findOne(id),
		findAllCategories: (params?: Parameters<AdminCategoriesService['findAll']>[0]) =>
			categories.findAll(params),
		createCategory: (data: Parameters<AdminCategoriesService['create']>[0]) =>
			categories.create(data),
		updateCategory: (id: string, data: Parameters<AdminCategoriesService['update']>[1]) =>
			categories.update(id, data),
		deleteCategory: (id: string) => categories.delete(id),
	};
}
