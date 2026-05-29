import {
	EventDifficultyEnum,
	EventStatusEnum,
	type Event,
	type EventFormValues,
	type EventImageItem,
	type ImageUploaderItem,
} from '@event-space/shared';

export function getDefaultEventFormValues(): EventFormValues {
	return {
		title: '',
		description: '',
		images: [],
		location: '',
		date: '',
		difficulty: EventDifficultyEnum.enum.EASY,
		status: EventStatusEnum.enum.DRAFT,
		price: '',
		maxParticipants: '',
		category: '',
		whatsIncluded: '',
		duration: '',
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
		title: values.title.trim(),
		description: values.description.trim(),
		location: values.location.trim(),
		date: new Date(values.date).toISOString(),
		difficulty: values.difficulty,
		price: Number(values.price),
		maxParticipants: Number(values.maxParticipants),
		category: values.category.trim(),
		whatsIncluded: parseList(values.whatsIncluded),
		duration: Number(values.duration),
		status: values.status,
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
		title: event.title,
		description: event.description,
		images,
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
