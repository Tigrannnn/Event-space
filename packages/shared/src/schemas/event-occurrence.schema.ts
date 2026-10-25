import z from 'zod';
import {
	EventOccurrenceStatusSchema,
	EventOccurrenceSchema as GeneratedEventOccurrenceSchema,
} from '../generated';
import { DISCOUNT_PERCENT_MAX, DISCOUNT_PERCENT_MIN } from '../utils/quote.utils';
import { EventSchema } from './event.schema';
import { CancellationReasonsSchema } from './cancellation-reason.schema';

export const CreateEventOccurrenceSchema = z.object({
	date: z.coerce.date(),
	maxParticipants: z.number().int().min(1).optional(),
	discountPercent: z
		.number()
		.int()
		.min(DISCOUNT_PERCENT_MIN)
		.max(DISCOUNT_PERCENT_MAX)
		.nullable()
		.optional(),
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
	/** Checked-in bookings — a subset of `confirmed`, not an extra status. Only on per-event stats. */
	checkedIn: z.number().int().optional(),
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

/** How many of those asked about a moved date have answered. */
export const RescheduleAnswersSchema = z.object({
	asked: z.number().int(),
	accepted: z.number().int(),
});

export type RescheduleAnswers = z.infer<typeof RescheduleAnswersSchema>;

export const EventOccurrenceSchema = GeneratedEventOccurrenceSchema.extend({
	maxParticipants: z.number().int(),
	currentParticipants: z.number().int(),
	discountPercent: z.number().int().nullable(),
	bookingStats: BookingStatusCountsSchema.optional(),
	rescheduleAnswers: RescheduleAnswersSchema.optional(),
});

export type EventOccurrence = z.infer<typeof EventOccurrenceSchema>;

export const EventOccurrenceWithEventSchema = EventOccurrenceSchema.extend({
	event: z.lazy(() => EventSchema),
});

export type EventOccurrenceWithEvent = z.infer<typeof EventOccurrenceWithEventSchema>;

export const CancelOccurrenceData = z.object({
	reasons: CancellationReasonsSchema.optional(),
});

export type CancelOccurrenceData = z.infer<typeof CancelOccurrenceData>;

export const RescheduleOccurrenceSchema = z.object({
	date: z.coerce.date(),
	reasons: CancellationReasonsSchema.optional(),
});

export type RescheduleOccurrenceData = z.infer<typeof RescheduleOccurrenceSchema>;

export const EventOccurrenceStatusEnum = EventOccurrenceStatusSchema;
export type EventOccurrenceStatus = z.infer<typeof EventOccurrenceStatusEnum>;
