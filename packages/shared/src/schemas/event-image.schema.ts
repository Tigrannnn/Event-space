import { z } from './openapi';
import { MAX_EVENT_IMAGES } from '../constants/event-images.constant';
import { CreateEventSchema } from './event.schema';

export const EventImageFileItemSchema = z
	.object({
		kind: z.literal('file'),
		order: z.number().int().min(0),
	})
	.openapi({ description: 'New image file; order matches position in multipart files[]' });

export const EventImageExistingItemSchema = z
	.object({
		kind: z.literal('existing'),
		id: z.string().uuid(),
		order: z.number().int().min(0),
	})
	.openapi({ description: 'Existing event image retained on update' });

export const EventImageItemSchema = z.discriminatedUnion('kind', [
	EventImageFileItemSchema,
	EventImageExistingItemSchema,
]);

export const CreateEventMultipartPayloadSchema = CreateEventSchema.extend({
	images: z.array(EventImageFileItemSchema).max(MAX_EVENT_IMAGES).default([]),
}).openapi({ description: 'JSON payload field for POST /events (multipart)' });

export const UpdateEventMultipartPayloadSchema = CreateEventSchema.partial()
	.extend({
		images: z.array(EventImageItemSchema).max(MAX_EVENT_IMAGES),
	})
	.openapi({ description: 'JSON payload field for PUT /events/:id (multipart)' });

export type EventImageFileItem = z.infer<typeof EventImageFileItemSchema>;
export type EventImageExistingItem = z.infer<typeof EventImageExistingItemSchema>;
export type EventImageItem = z.infer<typeof EventImageItemSchema>;
export type CreateEventMultipartPayload = z.infer<typeof CreateEventMultipartPayloadSchema>;
export type UpdateEventMultipartPayload = z.infer<typeof UpdateEventMultipartPayloadSchema>;
