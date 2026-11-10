import { AdminBookingsService } from './admin-bookings.service';
import { buildBookingLinkToken } from '@modules/booking/booking.utils';
import { bookingLinkSecret, verifyBookingLinkToken } from '@modules/booking/booking-link-token';
import { fakePrisma } from '../admin.test-helpers';

const DATE = new Date('2099-06-01T08:00:00.000Z');

function serviceFor(booking: unknown) {
	const { prisma } = fakePrisma({ 'booking.findUnique': booking });
	const config = {
		get: (key: string) => (key === 'FRONTEND_URL' ? 'http://localhost:3000/' : undefined),
		getOrThrow: () => 'jwt-secret',
	} as never;

	return new AdminBookingsService(prisma, {} as never, config);
}

describe('AdminBookingsService.getLinks', () => {
	it('builds the booking and review links with one token that opens that booking only', async () => {
		const service = serviceFor({
			id: 'b1',
			status: 'CONFIRMED',
			brandHost: null,
			user: { locale: 'ru' },
			occurrence: { date: DATE },
		});

		const { bookingUrl, reviewUrl } = await service.getLinks('b1');

		expect(bookingUrl).toMatch(/^http:\/\/localhost:3000\/ru\/bookings\/b1\?t=/);
		expect(reviewUrl).toMatch(/^http:\/\/localhost:3000\/ru\/bookings\/b1\/review\?t=/);

		const token = decodeURIComponent(new URL(bookingUrl as string).searchParams.get('t') as string);
		const secret = bookingLinkSecret(undefined, 'jwt-secret');

		expect(token).toBe(buildBookingLinkToken('b1', DATE, { jwtSecret: 'jwt-secret' }));
		expect(verifyBookingLinkToken('b1', token, secret, Date.now())).toBe(true);
		expect(verifyBookingLinkToken('b2', token, secret, Date.now())).toBe(false);
	});

	it('points at the brand host of the booking', async () => {
		const service = serviceFor({
			id: 'b1',
			status: 'CONFIRMED',
			brandHost: 'tours.example.am',
			user: { locale: null },
			occurrence: { date: DATE },
		});

		const { bookingUrl } = await service.getLinks('b1');

		expect(bookingUrl).toMatch(/^https:\/\/tours\.example\.am\/[a-z]{2}\/bookings\/b1\?t=/);
	});

	it('offers no review link for a booking that cannot be rated', async () => {
		const service = serviceFor({
			id: 'b1',
			status: 'CANCELLED',
			brandHost: null,
			user: { locale: 'en' },
			occurrence: { date: DATE },
		});

		const links = await service.getLinks('b1');

		expect(links.bookingUrl).not.toBeNull();
		expect(links.reviewUrl).toBeNull();
	});

	it('rejects an unknown booking', async () => {
		await expect(serviceFor(null).getLinks('missing')).rejects.toThrow();
	});
});
