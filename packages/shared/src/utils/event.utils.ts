import { Event } from '../schemas/event.schema';
import { Locale } from '../schemas/locale.schema';
import { EventTranslation } from '../generated/modelSchema/EventTranslationSchema';
import type { EventOccurrence } from '../generated/modelSchema/EventOccurrenceSchema';

type EventWithOccurrences = Partial<
	Omit<Event, 'date' | 'maxParticipants' | 'currentParticipants'>
> & {
	occurrences?: Array<Partial<EventOccurrence>> | null;
};

export function getUpcomingEventOccurrences(event: EventWithOccurrences): EventOccurrence[] {
	const occurrences = Array.isArray(event.occurrences) ? event.occurrences : [];
	if (!occurrences.length) return [];

	const now = Date.now();
	const durationMs = Number(event.duration ?? 0) * 60 * 1000;

	return [...occurrences]
		.filter((occ) => {
			const endTime = new Date(occ.date ?? 0).getTime() + durationMs;
			return endTime >= now;
		})
		.sort(
			(left, right) => new Date(left.date ?? 0).getTime() - new Date(right.date ?? 0).getTime(),
		) as EventOccurrence[];
}

export function getPrimaryEventOccurrence(
	event: EventWithOccurrences,
): EventOccurrence | undefined {
	const upcoming = getUpcomingEventOccurrences(event);
	if (upcoming.length > 0) return upcoming[0];

	const occurrences = Array.isArray(event.occurrences) ? event.occurrences : [];
	if (!occurrences.length) return undefined;

	return [...occurrences].sort(
		(left, right) => new Date(right.date ?? 0).getTime() - new Date(left.date ?? 0).getTime(),
	)[0] as EventOccurrence;
}

export function getEventPrimaryCapacity(event: EventWithOccurrences) {
	const occurrence = getPrimaryEventOccurrence(event);
	return {
		maxParticipants: Number(occurrence?.maxParticipants ?? 0),
		currentParticipants: Number(occurrence?.currentParticipants ?? 0),
	};
}

export function isEventAvailable(event: EventWithOccurrences): boolean {
	if (event.status !== 'PUBLISHED') return false;

	const occurrences = Array.isArray(event.occurrences) ? event.occurrences : [];
	if (!occurrences.length) return false;

	const now = Date.now();
	const durationMs = Number(event.duration ?? 0) * 60 * 1000;

	return occurrences.some((occ) => {
		const endTime = new Date(occ.date ?? 0).getTime() + durationMs;
		return endTime >= now;
	});
}

export function getEventTranslation(
	event: Partial<Event>,
	locale: Locale = 'en',
): EventTranslation {
	const translations = event?.translations || [];
	if (translations.length === 0) {
		return {
			id: '',
			eventId: '',
			locale: locale,
			title: '',
			description: '',
			location: '',
			whatsIncluded: [],
		};
	}
	let translation = translations.find((t) => t.locale === locale);
	if (!translation) {
		translation = translations.find((t) => t.locale === 'en');
	}
	if (!translation) {
		translation = translations[0];
	}
	return translation as EventTranslation;
}
