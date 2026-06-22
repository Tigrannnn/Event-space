import { Event, EventTranslation, Locale } from '../schemas/event.schema';

export function isEventAvailable(event: {
	status: string;
	date: Date | string;
	duration: number;
}): boolean {
	if (event.status !== 'PUBLISHED') return false;
	const endTime = new Date(event.date).getTime() + event.duration * 60 * 1000;
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
			category: '',
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
