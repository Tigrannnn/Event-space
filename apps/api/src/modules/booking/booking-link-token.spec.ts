import {
	bookingLinkSecret,
	signBookingLinkToken,
	verifyBookingLinkToken,
} from './booking-link-token';
import { reviewTokenSecret } from '../review/review-token';
import { checkinTokenSecret } from './checkin-token';

const SECRET = bookingLinkSecret(undefined, 'jwt-secret');
const NOW = 1_700_000_000_000;

describe('booking link token', () => {
	it('opens the booking it was made for', () => {
		const token = signBookingLinkToken('booking-1', NOW + 1000, SECRET);

		expect(verifyBookingLinkToken('booking-1', token, SECRET, NOW)).toBe(true);
	});

	it('does not open another booking', () => {
		const token = signBookingLinkToken('booking-1', NOW + 1000, SECRET);

		expect(verifyBookingLinkToken('booking-2', token, SECRET, NOW)).toBe(false);
	});

	it('stops working once it has expired', () => {
		const token = signBookingLinkToken('booking-1', NOW - 1, SECRET);

		expect(verifyBookingLinkToken('booking-1', token, SECRET, NOW)).toBe(false);
	});

	it('rejects a tampered expiry', () => {
		const token = signBookingLinkToken('booking-1', NOW + 1000, SECRET);
		const signature = token.slice(token.indexOf('.') + 1);

		expect(verifyBookingLinkToken('booking-1', `${NOW + 999999}.${signature}`, SECRET, NOW)).toBe(
			false,
		);
	});

	it('rejects missing and malformed tokens', () => {
		expect(verifyBookingLinkToken('booking-1', undefined, SECRET, NOW)).toBe(false);
		expect(verifyBookingLinkToken('booking-1', 'nonsense', SECRET, NOW)).toBe(false);
		expect(verifyBookingLinkToken('booking-1', '.abc', SECRET, NOW)).toBe(false);
	});

	it('is signed with a key of its own, apart from review links and check-in codes', () => {
		expect(SECRET).not.toBe(reviewTokenSecret(undefined, 'jwt-secret'));
		expect(SECRET).not.toBe(checkinTokenSecret(undefined, 'jwt-secret'));
	});
});
