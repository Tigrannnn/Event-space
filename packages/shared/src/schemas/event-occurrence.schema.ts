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

/**
 * How many bookings exist per status.
 *
 * Replaces the old `_count.bookings`, which meant "all bookings" in some endpoints and
 * "confirmed only" in others — the same field name, two different numbers, and no way to
 * tell them apart at the call site.
 */
export const BookingStatusCountsSchema = z.object({
	total: z.number().int(),
	pending: z.number().int(),
	confirmed: z.number().int(),
	cancelled: z.number().int(),
	expired: z.number().int(),
});

export type BookingStatusCounts = z.infer<typeof BookingStatusCountsSchema>;

/**
 * Bookings that still hold a seat. Deleting an occurrence is refused while any exist —
 * see `assertCanDelete` / `syncForEvent` on the API, which use the same rule.
 */
export function countsActiveBookings(stats?: BookingStatusCounts): number {
	if (!stats) return 0;
	return stats.pending + stats.confirmed;
}

export const EventOccurrenceSchema = GeneratedEventOccurrenceSchema.extend({
	maxParticipants: z.number().int(),
	currentParticipants: z.number().int(),
	bookingStats: BookingStatusCountsSchema.optional(),
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
