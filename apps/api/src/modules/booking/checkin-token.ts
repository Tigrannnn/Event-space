import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * The key that signs check-in QR codes. Same pattern as review-token.ts, but its own label, so
 * a code minted for one purpose can never be replayed as the other.
 */
export function checkinTokenSecret(configured: string | undefined, jwtSecret: string): string {
	return (
		configured?.trim() ||
		createHmac('sha256', jwtSecret).update('event-space:checkin').digest('hex')
	);
}

/**
 * Unlike a review link, the booking id has to travel inside the token: an admin scanning a QR
 * has nothing else to look it up by.
 */
export function signCheckinToken(bookingId: string, expiresAt: number, secret: string): string {
	return `${bookingId}.${expiresAt}.${sign(bookingId, expiresAt, secret)}`;
}

export function verifyCheckinToken(
	token: string | undefined,
	secret: string,
	now: number = Date.now(),
): string | null {
	if (!token) return null;

	const parts = token.split('.');
	if (parts.length !== 3) return null;

	const [bookingId, expiresAtRaw, signature] = parts;
	const expiresAt = Number(expiresAtRaw);

	if (!bookingId || !Number.isFinite(expiresAt) || expiresAt < now) return null;

	const expected = Buffer.from(sign(bookingId, expiresAt, secret));
	const received = Buffer.from(signature);

	if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

	return bookingId;
}

function sign(bookingId: string, expiresAt: number, secret: string): string {
	return createHmac('sha256', secret).update(`${bookingId}.${expiresAt}`).digest('base64url');
}
