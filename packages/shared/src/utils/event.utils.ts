import { Event } from '../schemas/event.schema';
import { Locale } from '../schemas/locale.schema';
import { EventTranslation } from '../generated/modelSchema/EventTranslationSchema';
import type { EventOccurrence } from '../generated/modelSchema/EventOccurrenceSchema';

type EventWithOccurrenceFallback = Partial<Event> & {
	date?: Date | string | null;
	maxParticipants?: number | null;
	currentParticipants?: number | null;
	occurrences?: Array<Partial<EventOccurrence>> | null;
};

export function getPrimaryEventOccurrence(event: EventWithOccurrenceFallback): EventOccurrence | undefined {
	const occurrences = Array.isArray(event.occurrences) ? event.occurrences : [];
	if (!occurrences.length) return undefined;

	return [...occurrences].sort((left, right) => {
		const leftTime = new Date(left.date ?? 0).getTime();
		const rightTime = new Date(right.date ?? 0).getTime();
		return leftTime - rightTime;
	})[0] as EventOccurrence;
}

export function getEventOccurrenceDate(event: EventWithOccurrenceFallback): Date | string | undefined {
	const occurrence = getPrimaryEventOccurrence(event);
	return occurrence?.date ?? event.date ?? undefined;
}

export function getEventCapacity(event: EventWithOccurrenceFallback) {
	const occurrence = getPrimaryEventOccurrence(event);
	return {
		maxParticipants: Number(occurrence?.maxParticipants ?? event.maxParticipants ?? 0),
		currentParticipants: Number(occurrence?.currentParticipants ?? event.currentParticipants ?? 0),
	};
}

export function isEventAvailable(event: EventWithOccurrenceFallback): boolean {
	if (event.status !== 'PUBLISHED') return false;

	const occurrenceDate = getEventOccurrenceDate(event);
	if (!occurrenceDate) return false;

	const endTime = new Date(occurrenceDate).getTime() + Number(event.duration ?? 0) * 60 * 1000;
	if (endTime < Date.now()) return false;
	return true;
}

export function getEventTranslation(event: Partial<Event>, locale: Locale = 'en'): EventTranslation {
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
