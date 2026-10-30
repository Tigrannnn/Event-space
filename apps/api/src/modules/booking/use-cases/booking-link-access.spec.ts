import { AppErrorCode } from '@event-space/shared';
import { AppException } from '@shared';
import { BookingQueryService } from './booking-query.service';
import { bookingLinkSecret, signBookingLinkToken } from '../booking-link-token';

const fakeConfig = { get: () => undefined, getOrThrow: () => 'test-secret' } as never;
const prisma = {
	booking: {
		findUnique: ({ where }: { where: { id: string } }) =>
			Promise.resolve(where.id === 'b1' ? { userId: 'owner' } : null),
	},
};
const service = new BookingQueryService(prisma as never, fakeConfig);
const linkSecret = bookingLinkSecret(undefined, 'test-secret');
const future = () => Date.now() + 60_000;

describe('acting on a booking by its link', () => {
	it('acts as the booking owner for a valid link, signed in or not', async () => {
		const token = signBookingLinkToken('b1', future(), linkSecret);

		await expect(service.resolveActor('b1', undefined, token)).resolves.toBe('owner');
		await expect(service.resolveActor('b1', 'someone-else', token)).resolves.toBe('owner');
	});

	it('falls back to the signed-in visitor when the link is no good', async () => {
		await expect(service.resolveActor('b1', 'visitor', 'bad.token')).resolves.toBe('visitor');
	});

	it('refuses with neither a link nor a sign-in', async () => {
		await expect(service.resolveActor('b1')).rejects.toMatchObject({
			constructor: AppException,
			code: AppErrorCode.UNAUTHORIZED,
		});
	});

	it('does not accept the link of another booking', async () => {
		const token = signBookingLinkToken('b2', future(), linkSecret);

		await expect(service.resolveActor('b1', undefined, token)).rejects.toMatchObject({
			code: AppErrorCode.UNAUTHORIZED,
		});
	});
});
