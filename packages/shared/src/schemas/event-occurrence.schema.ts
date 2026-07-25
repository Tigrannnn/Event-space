import z from 'zod';
import {
	EventOccurrenceStatusSchema,
	EventOccurrenceSchema as GeneratedEventOccurrenceSchema,
} from '../generated';
import { EventSchema } from './event.schema';

export const CreateEventOccurrenceSchema = z.object({
	date: z.coerce.date(),
	maxParticipants: z.number().int().min(1).optional(),
});

export const UpdateEventOccurrenceSchema = CreateEventOccurrenceSchema.extend({
	id: z.string().uuid().optional(),
});

export type UpdateEventOccurrenceData = z.infer<typeof UpdateEventOccurrenceSchema>;

export const EventOccurrenceSchema = GeneratedEventOccurrenceSchema.extend({
	maxParticipants: z.number().int(),
	currentParticipants: z.number().int(),
	_count: z.object({ bookings: z.number().int() }).optional(),
});

export type EventOccurrence = z.infer<typeof EventOccurrenceSchema>;

export const EventOccurrenceWithEventSchema = EventOccurrenceSchema.extend({
	event: z.lazy(() => EventSchema),
});

export type EventOccurrenceWithEvent = z.infer<typeof EventOccurrenceWithEventSchema>;

export const CancelOccurrenceData = z.object({
	reason: z.string().optional(),
});

export type CancelOccurrenceData = z.infer<typeof CancelOccurrenceData>;

export const EventOccurrenceStatusEnum = EventOccurrenceStatusSchema;
export type EventOccurrenceStatus = z.infer<typeof EventOccurrenceStatusEnum>;
