import { z } from 'zod';
import { EventOccurrenceStatusEnum, LocaleEnum, MAX_EVENT_IMAGES } from '@event-space/shared';
import { EventDifficultyEnum, EventStatusEnum } from '@event-space/shared';

const browserFileSchema = z.custom<File>(
	(val) => typeof File !== 'undefined' && val instanceof File,
	{
		message: 'admin.validation.fileExpected',
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
	title: z.string().min(1, 'admin.validation.titleRequired'),
	description: z.string().min(1, 'admin.validation.descriptionRequired'),
	location: z.string().min(1, 'admin.validation.locationRequired'),
	meetingLocation: z.string().min(1, 'admin.validation.meetingLocationRequired'),
	// Optional, as its label says: an empty list is sent as [] and the API accepts it.
	whatsIncluded: z.string(),
});

export const EventOccurrenceFormSchema = z.object({
	id: z.string().uuid().optional(),
	date: z.string().min(1, 'admin.validation.dateRequired'),
	maxParticipants: z.string().optional(),
	status: EventOccurrenceStatusEnum.default(EventOccurrenceStatusEnum.enum.ACTIVE).optional(),
	/**
	 * Bookings that still hold a seat (pending + confirmed) — the same rule the API uses to
	 * refuse deleting an occurrence, so the form and the server agree on what is removable.
	 */
	activeBookingsCount: z.number().optional(),
});

export const EventFormSchema = z.object({
	categoryId: z.string().min(1, 'admin.validation.categoryRequired'),
	translations: z.array(EventTranslationFormSchema).min(1, 'admin.validation.translationRequired'),
	images: z
		.array(ImageUploaderItemSchema)
		.min(1, 'admin.validation.imageRequired')
		.max(MAX_EVENT_IMAGES),
	locationUrl: z.string().url('admin.validation.invalidUrl'),
	meetingLocationUrl: z.string().url('admin.validation.invalidUrl'),
	date: z.string().optional(),
	difficulty: z.union([EventDifficultyEnum, z.literal('')]).optional(),
	price: z.string().min(1, 'admin.validation.priceRequired'),
	maxParticipants: z.string().optional(),
	duration: z.string().min(1, 'admin.validation.durationRequired'),
	status: EventStatusEnum,
	occurrences: z.array(EventOccurrenceFormSchema).min(1, 'admin.validation.occurrenceRequired'),
	cancellationRules: z
		.array(
			z.object({
				hoursBeforeEvent: z.number({ message: 'admin.validation.mustBeNumber' }).min(1, 'admin.validation.hoursMin'),
				refundPercentage: z
					.number({ message: 'admin.validation.mustBeNumber' })
					.min(0, 'admin.validation.percentageMin')
					.max(100, 'admin.validation.percentageMax'),
			}),
		)
		.default([])
		.optional(),
	cancellationReason: z.string().optional(),
});

export type EventFormValues = z.infer<typeof EventFormSchema>;
