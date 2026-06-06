import { z } from 'zod';
import { MAX_EVENT_IMAGES } from '@event-space/shared';
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

export const EventFormSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	description: z.string().min(1, 'Description is required'),
	images: z
		.array(ImageUploaderItemSchema)
		.min(1, 'At least one image is required')
		.max(MAX_EVENT_IMAGES),
	location: z.string().min(1, 'Location is required'),
	date: z.string().min(1, 'Date is required'),
	difficulty: EventDifficultyEnum,
	price: z.string().min(1, 'Price is required'),
	maxParticipants: z.string().min(1, 'Max participants is required'),
	category: z.string().min(1, 'Category is required'),
	whatsIncluded: z.string().min(1, 'Included items are required'),
	duration: z.string().min(1, 'Duration is required'),
	status: EventStatusEnum,
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
});

export type EventFormValues = z.infer<typeof EventFormSchema>;
