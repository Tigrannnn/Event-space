import { z } from './openapi';
import { MAX_EVENT_IMAGES } from '../constants/event-images.constant';
import { CreateEventSchema } from './event.schema';

// ============================================================
// API: MULTIPART UPLOAD SCHEMAS
// ============================================================
// These schemas represent the structure of images during upload
// (when client sends multipart form data to the server)

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

// ============================================================
// UI: IMAGE UPLOADER STATE SCHEMAS
// ============================================================
// These schemas represent the component state (form data on client)
// Includes File object for client-side preview and upload

export type ImageUploaderExistingItem = {
	kind: 'existing';
	id: string;
	url: string;
	publicId: string;
	order: number;
};

export type ImageUploaderFileItem = {
	kind: 'file';
	file: File;
	previewUrl: string;
	order: number;
};

export type ImageUploaderItem = ImageUploaderExistingItem | ImageUploaderFileItem;

const browserFileSchema = z
	.custom<File>((val) => typeof File !== 'undefined' && val instanceof File, {
		message: 'Expected a File',
	})
	.openapi({
		type: 'string',
		format: 'binary',
		description: 'Browser File (client-only; not sent as JSON)',
	});

export const ImageUploaderFileItemSchema = z
	.object({
		kind: z.literal('file'),
		file: browserFileSchema,
		previewUrl: z.string().min(1),
		order: z.number().int().min(0),
	})
	.openapi({ description: 'New image file in EventForm UI state' });

export const ImageUploaderExistingItemSchema = z
	.object({
		kind: z.literal('existing'),
		id: z.string().uuid(),
		url: z.string().url(),
		publicId: z.string().min(1),
		order: z.number().int().min(0),
	})
	.openapi({ description: 'Existing image in EventForm UI state' });

export const ImageUploaderItemSchema = z.discriminatedUnion('kind', [
	ImageUploaderExistingItemSchema,
	ImageUploaderFileItemSchema,
]);
