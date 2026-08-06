import { getEventTranslation, type Event, type Locale } from '@event-space/shared';

/** Enough dates to cover a season; a schedule longer than this is noise in a search result. */
const MAX_DATES = 20;

/**
 * Describes an event to a search engine in schema.org's vocabulary.
 *
 * The page already says everything in prose, but only to a human — a crawler cannot tell a price
 * from a phone number. This repeats the same facts in a form it parses, which is what turns a
 * plain blue link into a result carrying the date, the price and whether tickets are left.
 *
 * One entry per upcoming date rather than one per event: each date is a separate thing a person
 * can attend, and a single entry could only advertise one of them. Past and cancelled dates are
 * left out — a result promising a date that has gone is worse than no result.
 */
export function buildEventJsonLd(event: Event, locale: Locale, url: string): object[] {
	const translation = getEventTranslation(event, locale);
	const now = Date.now();

	const upcoming = (event.occurrences ?? [])
		.filter(
			(occurrence) =>
				occurrence.status === 'ACTIVE' && new Date(occurrence.date).getTime() > now,
		)
		.sort((first, second) => new Date(first.date).getTime() - new Date(second.date).getTime())
		.slice(0, MAX_DATES);

	const images = [...(event.images ?? [])]
		.sort((first, second) => first.order - second.order)
		.map((image) => image.url);

	return upcoming.map((occurrence) => {
		const start = new Date(occurrence.date);
		const end = new Date(start.getTime() + event.duration * 60_000);
		const soldOut = occurrence.currentParticipants >= occurrence.maxParticipants;

		return {
			'@context': 'https://schema.org',
			'@type': 'Event',
			name: translation.title,
			description: translation.description,
			inLanguage: locale,
			url,
			startDate: start.toISOString(),
			endDate: end.toISOString(),
			eventStatus: 'https://schema.org/EventScheduled',
			eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
			...(images.length ? { image: images } : {}),
			location: {
				'@type': 'Place',
				name: translation.location,
				address: translation.location,
				...(isHttpUrl(event.locationUrl) ? { hasMap: event.locationUrl } : {}),
			},
			offers: {
				'@type': 'Offer',
				price: event.price,
				priceCurrency: 'AMD',
				availability: soldOut ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
				url,
			},
			...(event.organizer?.name
				? { organizer: { '@type': 'Organization', name: event.organizer.name } }
				: {}),
		};
	});
}

/**
 * Serialises structured data for a <script> tag.
 *
 * The escaping is the point: this content comes from the database, and a description containing
 * the characters that close a script tag would end the block early and drop whatever follows into
 * the page as markup. Escaping `<` as a unicode sequence keeps the JSON identical in meaning while
 * making that impossible.
 */
export function serializeJsonLd(data: object[]): string {
	return JSON.stringify(data.length === 1 ? data[0] : data).replace(/</g, '\\u003c');
}

function isHttpUrl(value: string | undefined): boolean {
	return !!value && /^https?:\/\//i.test(value);
}
