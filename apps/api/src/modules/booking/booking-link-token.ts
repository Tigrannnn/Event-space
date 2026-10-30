import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * The key that signs the link to one's own booking. Derived with a label of its own, so a link
 * can never be replayed as a review invitation or a check-in code, nor the other way round.
 */
export function bookingLinkSecret(configured: string | undefined, jwtSecret: string): string {
	return (
		configured?.trim() ||
		createHmac('sha256', jwtSecret).update('event-space:booking-link').digest('hex')
	);
}

/**
 * The key to a booking for someone with no account. The booking id is not inside the token, it
 * is in the path being signed: a link made for one booking proves nothing about another.
 */
export function signBookingLinkToken(
	bookingId: string,
	expiresAt: number,
	secret: string,
): string {
	return `${expiresAt}.${sign(bookingId, expiresAt, secret)}`;
}

export function verifyBookingLinkToken(
	bookingId: string,
	token: string | undefined,
	secret: string,
	now: number = Date.now(),
): boolean {
	if (!token) return false;

	const separator = token.indexOf('.');
	if (separator <= 0) return false;

	const expiresAt = Number(token.slice(0, separator));
	const signature = token.slice(separator + 1);

	if (!Number.isFinite(expiresAt) || expiresAt < now) return false;

	const expected = Buffer.from(sign(bookingId, expiresAt, secret));
	const received = Buffer.from(signature);

	return expected.length === received.length && timingSafeEqual(expected, received);
}

function sign(bookingId: string, expiresAt: number, secret: string): string {
	return createHmac('sha256', secret).update(`${bookingId}.${expiresAt}`).digest('base64url');
}
