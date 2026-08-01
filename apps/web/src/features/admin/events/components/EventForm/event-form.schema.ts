import { z } from 'zod';
import { EventOccurrenceStatusEnum, LocaleEnum, MAX_EVENT_IMAGES } from '@event-space/shared';
import { EventDifficultyEnum, EventStatusEnum } from '@event-space/shared';

const browserFileSchema = z.custom<File>(
	(val) => typeof File !== 'undefined' && val instanceof File,
	{
		message: 'Expected a File',
	},
);

const ImageUploaderFileItemSchema = z.object({
	kind: z.literal('file'),
	file: browserFileSchema,
	previewUrl: z.string().min(1),
	order: z.number().int().min(0),
});

const ImageUploaderExistingItemSchema = z.object({
	kind: z.literal('existing'),
	id: z.string().uuid(),
	url: z.string().url(),
	publicId: z.string().min(1),
	order: z.number().int().min(0),
});

const ImageUploaderItemSchema = z.discriminatedUnion('kind', [
	ImageUploaderExistingItemSchema,
	ImageUploaderFileItemSchema,
]);

export const EventTranslationFormSchema = z.object({
	locale: LocaleEnum,
	title: z.string().min(1, 'Title is required'),
	description: z.string().min(1, 'Description is required'),
	location: z.string().min(1, 'Location is required'),
	meetingLocation: z.string().min(1, 'Meeting location is required'),
	whatsIncluded: z.string().min(1, 'Included items are required'),
});

export const EventOccurrenceFormSchema = z.object({
	id: z.string().uuid().optional(),
	date: z.string().min(1, 'Date is required'),
	maxParticipants: z.string().optional(),
	status: EventOccurrenceStatusEnum.default(EventOccurrenceStatusEnum.enum.ACTIVE).optional(),
	/**
	 * Bookings that still hold a seat (pending + confirmed) — the same rule the API uses to
	 * refuse deleting an occurrence, so the form and the server agree on what is removable.
	 */
	activeBookingsCount: z.number().optional(),
});

export const EventFormSchema = z.object({
	categoryId: z.string().min(1, 'Category is required'),
	translations: z.array(EventTranslationFormSchema).min(1, 'At least one translation is required'),
	images: z
		.array(ImageUploaderItemSchema)
		.min(1, 'At least one image is required')
		.max(MAX_EVENT_IMAGES),
	locationUrl: z.string().url('Must be a valid URL'),
	meetingLocationUrl: z.string().url('Must be a valid URL'),
	date: z.string().optional(),
	difficulty: z.union([EventDifficultyEnum, z.literal('')]).optional(),
	price: z.string().min(1, 'Price is required'),
	maxParticipants: z.string().optional(),
	duration: z.string().min(1, 'Duration is required'),
	status: EventStatusEnum,
	occurrences: z.array(EventOccurrenceFormSchema).min(1, 'At least one occurrence is required'),
	cancellationRules: z
		.array(
			z.object({
				hoursBeforeEvent: z.number({ message: 'Must be a number' }).min(1, 'Hours must be at least 1'),
				refundPercentage: z
					.number({ message: 'Must be a number' })
					.min(0, 'Percentage cannot be negative')
					.max(100, 'Percentage cannot exceed 100'),
			}),
		)
		.default([])
		.optional(),
	cancellationReason: z.string().optional(),
});

export type EventFormValues = z.infer<typeof EventFormSchema>;
