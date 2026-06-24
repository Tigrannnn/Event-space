import { EventStatusEnum, type Event, type EventImageItem } from '@event-space/shared';
import type { EventFormValues } from './event-form.schema';
import type { ImageUploaderItem } from '@/components/ui/ImageUploader/types';

export function getDefaultEventFormValues(): EventFormValues {
	return {
		translations: [],
		images: [],
		locationUrl: '',
		date: '',
		difficulty: undefined,
		status: EventStatusEnum.enum.DRAFT,
		price: '',
		maxParticipants: '',
		duration: '',
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
	};
}

function parseList(val: string): string[] {
	return val
		.split('\n')
		.map((s) => s.trim())
		.filter(Boolean);
}

function buildEventFields(values: EventFormValues) {
	return {
		locationUrl: values.locationUrl?.trim() || null,
		date: new Date(values.date).toISOString(),
		difficulty: values.difficulty,
		price: parseFloat(parseFloat(values.price).toFixed(2)),
		maxParticipants: Number(values.maxParticipants),
		duration: Number(values.duration),
		status: values.status,
		cancellationRules: values.cancellationRules,
		translations: values.translations.map((t) => ({
			locale: t.locale,
			title: t.title.trim(),
			description: t.description.trim(),
			category: t.category.trim(),
			location: t.location.trim(),
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

	const d = new Date(event.date);
	const dateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

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

	return {
		images,
		locationUrl: event.locationUrl ?? '',
		date: dateStr,
		difficulty: event.difficulty ?? undefined,
		price: String(event.price),
		maxParticipants: String(event.maxParticipants),
		duration: String(event.duration),
		status: event.status,
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
			category: t.category,
			location: t.location,
			whatsIncluded: t.whatsIncluded.join('\n'),
		})),
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
