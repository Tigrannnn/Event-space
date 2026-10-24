import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * The key that signs review links.
 *
 * A dedicated secret when there is one. Otherwise one is derived from the access-token secret
 * with a label of its own: a deployment that has not set the new variable still boots, and a
 * derived key can never be mistaken for — or used as — an auth token, because the label makes
 * it a different key entirely.
 */
export function reviewTokenSecret(configured: string | undefined, jwtSecret: string): string {
	return (
		configured?.trim() ||
		createHmac('sha256', jwtSecret).update('event-space:review-link').digest('hex')
	);
}

/**
 * A link for someone with no password: the guests an admin books by hand.
 *
 * The booking id is not inside the token — it is already in the path being signed, so a token
 * minted for one booking proves nothing about another.
 */
export function signReviewToken(bookingId: string, expiresAt: number, secret: string): string {
	return `${expiresAt}.${sign(bookingId, expiresAt, secret)}`;
}

export function verifyReviewToken(
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

	// Lengths must match before the constant-time compare, which throws on a mismatch.
	return expected.length === received.length && timingSafeEqual(expected, received);
}

function sign(bookingId: string, expiresAt: number, secret: string): string {
	return createHmac('sha256', secret).update(`${bookingId}.${expiresAt}`).digest('base64url');
}
