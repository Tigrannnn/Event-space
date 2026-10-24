/**
 * Links that go into emails.
 *
 * The host comes from the booking's own brand, so a letter about a tour sold on one brand's
 * site never points at another's. Localhost falls back to the configured front-end URL, which
 * is what development and anything without a brand host end up using.
 */
export function siteUrlFor(brandHost: string | null | undefined, fallback: string): string {
	const host = brandHost?.split(':')[0]?.trim();

	if (host && host !== 'localhost' && host !== '127.0.0.1') {
		return `https://${host}`;
	}

	return fallback.replace(/\/+$/, '');
}

export function reviewFormUrl(
	siteUrl: string,
	locale: string,
	bookingId: string,
	token: string,
): string {
	return `${siteUrl}/${locale}/bookings/${bookingId}/review?t=${encodeURIComponent(token)}`;
}

export function eventUrl(siteUrl: string, locale: string, eventId: string): string {
	return `${siteUrl}/${locale}/events/${eventId}`;
}

export function reviewQueueUrl(siteUrl: string, locale: string): string {
	return `${siteUrl}/${locale}/admin/reviews`;
}
