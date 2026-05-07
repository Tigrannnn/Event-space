import type { Event, CreateEventData, EventFormValues } from '@event-space/shared';

/**
 * Converts an event object from the API into a format suitable for the form.
 * Solves the date problem (Date -> ISO string for datetime-local)
 * and lists (Array -> String with newlines).
 */
export function mapEventToFormValues(event?: Event): Partial<EventFormValues> {
	if (!event) return {};

	const d = new Date(event.date);
	const dateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

	return {
		title: event.title,
		description: event.description,
		images: event.images.join('\n'),
		location: event.location,
		date: dateStr,
		difficulty: event.difficulty,
		price: String(event.price),
		maxParticipants: String(event.maxParticipants),
		category: event.category,
		whatsIncluded: event.whatsIncluded.join('\n'),
		duration: String(event.duration),
		status: event.status,
	};
}

/**
 * Converts form data into a pure object for the API.
 * Parses numbers and dates, splits text into arrays.
 */
export function mapFormValuesToPayload(values: EventFormValues): CreateEventData {
	const parseList = (val: string) =>
		val
			.split('\n')
			.map((s) => s.trim())
			.filter(Boolean);

	return {
		title: values.title.trim(),
		description: values.description.trim(),
		images: parseList(values.images),
		location: values.location.trim(),
		date: new Date(values.date),
		difficulty: values.difficulty,
		price: Number(values.price),
		maxParticipants: Number(values.maxParticipants),
		category: values.category.trim(),
		whatsIncluded: parseList(values.whatsIncluded),
		duration: Number(values.duration),
		status: values.status,
	};
}
