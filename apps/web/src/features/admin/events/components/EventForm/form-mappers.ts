import {
	compactCancellationReasons,
	countsActiveBookings,
	EventDifficultyEnum,
	EventStatusEnum,
	normalizeDiscountPercent,
	type Event,
	type EventImageItem,
	toZonedLocalInput,
	zonedLocalInputToDate,
} from '@event-space/shared';
import type { EventFormValues } from './event-form.schema';
import type { ImageUploaderItem } from '@/components/ui/ImageUploader/types';

function fromDateTimeLocalInput(value: string): string {
	return (zonedLocalInputToDate(value) ?? new Date(value)).toISOString();
}

export function getDefaultEventFormValues(): EventFormValues {
	return {
		categoryId: '',
		translations: [],
		images: [],
		locationUrl: '',
		meetingLocationUrl: '',
		date: '',
		difficulty: EventDifficultyEnum.enum.NONE,
		status: EventStatusEnum.enum.DRAFT,
		price: '',
		maxParticipants: '',
		duration: '',
		occurrences: [{ date: '', maxParticipants: '', discountPercent: '' }],
		cancellationRules: [
			{
				hoursBeforeEvent: 72,
				refundPercentage: 100,
			},
			{
				hoursBeforeEvent: 24,
				refundPercentage: 50,
			},
		],
		cancellationReasons: undefined,
	};
}

function parseList(val: string): string[] {
	return val
		.split('\n')
		.map((s) => s.trim())
		.filter(Boolean);
}

function normalizeOptionalString(value?: string): string | undefined {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
}

function buildEventFields(values: EventFormValues) {
	const occurrences = values.occurrences
		.filter((occurrence) => occurrence.date)
		.map((occurrence) => ({
			id: occurrence.id,
			date: fromDateTimeLocalInput(occurrence.date),
			maxParticipants: occurrence.maxParticipants ? Number(occurrence.maxParticipants) : undefined,
			discountPercent: normalizeDiscountPercent(Number(occurrence.discountPercent)) || null,
		}));

	const primaryOccurrence = occurrences[0];

	return {
		categoryId: values.categoryId,
		locationUrl: normalizeOptionalString(values.locationUrl),
		meetingLocationUrl: normalizeOptionalString(values.meetingLocationUrl),
		date: primaryOccurrence?.date ?? fromDateTimeLocalInput(values.date ?? ''),
		difficulty: values.difficulty,
		price: parseFloat(parseFloat(values.price).toFixed(2)),
		maxParticipants:
			primaryOccurrence?.maxParticipants ?? (Number(values.maxParticipants || 0) || undefined),
		duration: Number(values.duration),
		status: values.status,
		occurrences,
		cancellationRules: values.cancellationRules,
		cancellationReasons: compactCancellationReasons(values.cancellationReasons),
		translations: values.translations.map((t) => ({
			locale: t.locale,
			title: t.title.trim(),
			description: t.description.trim(),
			location: t.location.trim(),
			meetingLocation: t.meetingLocation.trim(),
			whatsIncluded: parseList(t.whatsIncluded),
		})),
	};
}

function buildPayloadImages(items: ImageUploaderItem[]): {
	imageItems: EventImageItem[];
	files: File[];
} {
	const sorted = [...items].sort((a, b) => a.order - b.order);
	const imageItems: EventImageItem[] = [];
	const files: File[] = [];

	for (const item of sorted) {
		if (item.kind === 'existing') {
			imageItems.push({ kind: 'existing', id: item.id, order: item.order });
			continue;
		}
		imageItems.push({ kind: 'file', order: item.order });
		files.push(item.file);
	}

	return { imageItems, files };
}

export function mapEventToFormValues(event?: Event): EventFormValues {
	if (!event) return getDefaultEventFormValues();

	const images: ImageUploaderItem[] = (event.images ?? [])
		.slice()
		.sort((a, b) => a.order - b.order)
		.map((img) => ({
			kind: 'existing' as const,
			id: img.id,
			url: img.url,
			publicId: img.publicId,
			order: img.order,
		}));

	const occurrences = (event.occurrences ?? []).map((occurrence) => ({
		id: occurrence.id,
		date: toZonedLocalInput(occurrence.date),
		maxParticipants: String(occurrence.maxParticipants ?? ''),
		discountPercent: occurrence.discountPercent ? String(occurrence.discountPercent) : '',
		status: occurrence.status,
		activeBookingsCount: countsActiveBookings(occurrence.bookingStats),
		previousDate: occurrence.previousDate ? toZonedLocalInput(occurrence.previousDate) : undefined,
	}));

	return {
		categoryId: event.categoryId,
		images,
		locationUrl: event.locationUrl ?? '',
		meetingLocationUrl: event.meetingLocationUrl ?? '',
		difficulty: event.difficulty,
		price: String(event.price),
		duration: String(event.duration),
		status: event.status,
		occurrences:
			occurrences.length > 0 ? occurrences : [{ date: '', maxParticipants: '', discountPercent: '' }],
		cancellationRules: (event.cancellationRules ?? [])
			.slice()
			.sort((a, b) => b.hoursBeforeEvent - a.hoursBeforeEvent)
			.map((rule) => ({
				hoursBeforeEvent: rule.hoursBeforeEvent,
				refundPercentage: rule.refundPercentage,
			})),
		translations: (event.translations ?? []).map((t) => ({
			locale: t.locale,
			title: t.title,
			description: t.description,
			location: t.location,
			meetingLocation: t.meetingLocation,
			whatsIncluded: t.whatsIncluded.join('\n'),
		})),
		cancellationReasons: undefined,
	};
}

export function buildCreateEventFormData(values: EventFormValues): FormData {
	const { imageItems, files } = buildPayloadImages(values.images);
	const payload = {
		...buildEventFields(values),
		images: imageItems.filter((item) => item.kind === 'file'),
	};

	const formData = new FormData();
	formData.append('payload', JSON.stringify(payload));
	for (const file of files) {
		formData.append('files', file);
	}
	return formData;
}

export function buildUpdateEventFormData(values: EventFormValues): FormData {
	const { imageItems, files } = buildPayloadImages(values.images);
	const payload = {
		...buildEventFields(values),
		images: imageItems,
	};

	const formData = new FormData();
	formData.append('payload', JSON.stringify(payload));
	for (const file of files) {
		formData.append('files', file);
	}
	return formData;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const MAX_GUESSED_STEP_DAYS = 31;

const startOfDay = (value: string): number =>
	new Date(`${value.split('T')[0]}T00:00:00.000Z`).getTime();

export function nextOccurrenceDraft(
	existing: { date?: string; maxParticipants?: string; discountPercent?: string }[],
): { date: string; maxParticipants: string; discountPercent: string } {
	const dated = existing
		.filter((occurrence) => occurrence.date)
		.sort((a, b) => (a.date as string).localeCompare(b.date as string));

	const latest = dated.at(-1);
	if (!latest?.date) return { date: '', maxParticipants: '', discountPercent: '' };

	const from = startOfDay(latest.date);
	if (Number.isNaN(from)) {
		return {
			date: '',
			maxParticipants: latest.maxParticipants ?? '',
			discountPercent: latest.discountPercent ?? '',
		};
	}

	const previous = dated.at(-2)?.date;
	const gap = previous ? Math.round((from - startOfDay(previous)) / DAY_MS) : 1;
	const step = gap >= 1 && gap <= MAX_GUESSED_STEP_DAYS ? gap : 1;

	const time = latest.date.split('T')[1] ?? '00:00';

	return {
		date: `${new Date(from + step * DAY_MS).toISOString().slice(0, 10)}T${time}`,
		maxParticipants: latest.maxParticipants ?? '',
		discountPercent: latest.discountPercent ?? '',
	};
}
