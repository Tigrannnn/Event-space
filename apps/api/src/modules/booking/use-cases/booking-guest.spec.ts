import { AppErrorCode } from '@event-space/shared';
import { AppException } from '@shared';
import { BookingCreationService } from './booking-creation.service';
import { bookingLinkSecret, verifyBookingLinkToken } from '../booking-link-token';

const HOUR = 60 * 60 * 1000;
const fakeConfig = { get: () => undefined, getOrThrow: () => 'test-secret' } as never;

const guest = {
	occurrenceId: 'o1',
	quantity: 2,
	phone: '+374 99 123 456',
	paymentMethod: 'STRIPE' as const,
	name: 'Anna',
	email: 'anna@example.com',
};

function build(existing: { id: string; emailVerified: boolean } | null = null) {
	const created: Record<string, unknown>[] = [];
	const updated: Record<string, unknown>[] = [];
	const occurrenceDate = new Date(Date.now() + 240 * HOUR);

	const prisma = {
		user: {
			findUnique: () => Promise.resolve(existing),
			create: (args: { data: Record<string, unknown> }) => {
				created.push(args.data);
				return Promise.resolve({ id: 'shadow-1' });
			},
			update: (args: { data: Record<string, unknown> }) => {
				updated.push(args.data);
				return Promise.resolve({ id: existing?.id });
			},
		},
		eventOccurrence: { findUniqueOrThrow: () => Promise.resolve({ date: occurrenceDate }) },
	};

	const service = new BookingCreationService(
		prisma as never,
		{} as never,
		{} as never,
		{} as never,
		{} as never,
		{} as never,
		fakeConfig,
	);
	const bookings: { userId: string; data: Record<string, unknown> }[] = [];
	jest.spyOn(service, 'create').mockImplementation((userId, data) => {
		bookings.push({ userId, data: data as never });
		return Promise.resolve({ booking: { id: 'b1' }, clientSecret: 'secret' } as never);
	});

	return { service, created, updated, bookings, occurrenceDate };
}

describe('booking as a guest', () => {
	it('makes a guest profile for a new email and books for it', async () => {
		const { service, created, bookings } = build();

		const result = await service.createGuest(guest, 'ru', 'dilitour.event-space.space');

		expect(created).toEqual([
			expect.objectContaining({
				email: 'anna@example.com',
				name: 'Anna',
				isShadow: true,
				emailVerified: false,
			}),
		]);
		expect(bookings).toHaveLength(1);
		expect(bookings[0].userId).toBe('shadow-1');
		expect(bookings[0].data).not.toHaveProperty('email');
		expect(bookings[0].data).not.toHaveProperty('name');
		expect(result.clientSecret).toBe('secret');
	});

	it('hands back a key that opens this booking and no other', async () => {
		const { service } = build();

		const { accessToken } = await service.createGuest(guest, 'ru');
		const secret = bookingLinkSecret(undefined, 'test-secret');

		expect(verifyBookingLinkToken('b1', accessToken, secret)).toBe(true);
		expect(verifyBookingLinkToken('b2', accessToken, secret)).toBe(false);
	});

	it('reuses a guest profile the email already leads to, refreshing the name and phone', async () => {
		const { service, created, updated, bookings } = build({ id: 'shadow-9', emailVerified: false });

		await service.createGuest(guest, 'hy');

		expect(created).toHaveLength(0);
		expect(updated).toEqual([{ name: 'Anna', phone: '+374 99 123 456', locale: 'hy' }]);
		expect(bookings[0].userId).toBe('shadow-9');
	});

	it('refuses an email that belongs to a confirmed account and books nothing', async () => {
		const { service, created, bookings } = build({ id: 'u1', emailVerified: true });

		await expect(service.createGuest(guest, 'ru')).rejects.toMatchObject({
			constructor: AppException,
			code: AppErrorCode.EMAIL_ALREADY_EXISTS,
		});
		expect(created).toHaveLength(0);
		expect(bookings).toHaveLength(0);
	});
});
