import { z } from 'zod';
import { EventDifficultyEnum, EventStatusEnum } from './event.schema';

/**
 * Схема для UI-формы. Здесь все поля, которые приходят из инпутов как строки, 
 * описаны как строки, чтобы RHF и Zod не конфликтовали с типами HTML.
 */
export const EventFormSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	description: z.string().min(1, 'Description is required'),
	images: z.string().min(1, 'At least one image URL is required'),
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