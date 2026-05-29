import { z } from 'zod';
import { MAX_EVENT_IMAGES } from '../constants/event-images.constant';
import { EventDifficultyEnum, EventStatusEnum } from './event.schema';
import { ImageUploaderItemSchema } from './event-image.schema';

/**
 * UI form schema for creating/editing events.
 * String fields match HTML inputs; images array holds local File + existing rows.
 * Used in web admin panel for form validation and state management.
 */
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
});

export type EventFormValues = z.infer<typeof EventFormSchema>;
