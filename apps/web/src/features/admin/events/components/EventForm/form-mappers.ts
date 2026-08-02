import {
	countsActiveBookings,
	EventStatusEnum,
	type Event,
	type EventImageItem,
} from '@event-space/shared';
import type { EventFormValues } from './event-form.schema';
import type { ImageUploaderItem } from '@/components/ui/ImageUploader/types';

function toDateTimeLocalInput(value: string | Date): string {
	const date = new Date(value);
	const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
	return local.toISOString().slice(0, 16);
}

export function getDefaultEventFormValues(): EventFormValues {
	return {
		categoryId: '',
		translations: [],
		images: [],
		locationUrl: '',
		meetingLocationUrl: '',
		date: '',
		difficulty: '',
		status: EventStatusEnum.enum.DRAFT,
		price: '',
		maxParticipants: '',
		duration: '',
		occurrences: [{ date: '', maxParticipants: '' }],
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
		cancellationReason: undefined,
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
			date: new Date(occurrence.date).toISOString(),
			maxParticipants: occurrence.maxParticipants ? Number(occurrence.maxParticipants) : undefined,
		}));

	const primaryOccurrence = occurrences[0];

	return {
		categoryId: values.categoryId,
		locationUrl: normalizeOptionalString(values.locationUrl),
		meetingLocationUrl: normalizeOptionalString(values.meetingLocationUrl),
		date: primaryOccurrence?.date ?? new Date(values.date ?? '').toISOString(),
		difficulty: values.difficulty || undefined,
		price: parseFloat(parseFloat(values.price).toFixed(2)),
		maxParticipants:
			primaryOccurrence?.maxParticipants ?? (Number(values.maxParticipants || 0) || undefined),
		duration: Number(values.duration),
		status: values.status,
		occurrences,
		cancellationRules: values.cancellationRules,
		cancellationReason: values.cancellationReason?.trim() || undefined,
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
		date: toDateTimeLocalInput(occurrence.date),
		maxParticipants: String(occurrence.maxParticipants ?? ''),
		status: occurrence.status,
		activeBookingsCount: countsActiveBookings(occurrence.bookingStats),
	}));

	return {
		categoryId: event.categoryId,
		images,
		locationUrl: event.locationUrl ?? '',
		meetingLocationUrl: event.meetingLocationUrl ?? '',
		difficulty: event.difficulty ?? '',
		price: String(event.price),
		duration: String(event.duration),
		status: event.status,
		occurrences: occurrences.length > 0 ? occurrences : [{ date: '', maxParticipants: '' }],
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
		cancellationReason: undefined,
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
