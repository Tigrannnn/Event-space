import { z } from './openapi';
import { BookingSchema as GeneratedBookingSchema } from '../generated/modelSchema/BookingSchema';
import { BookingStatusSchema } from '../generated/inputTypeSchemas/BookingStatusSchema';
import { EventSchema } from './event.schema';
import { SafeUserSchema } from './user.schema';

export const BookingStatusEnum = BookingStatusSchema;
export type BookingStatus = z.infer<typeof BookingStatusEnum>;

export const BookingSchema = GeneratedBookingSchema.openapi({
	description: 'Booking information',
	example: {
		id: '550e8400-e29b-41d4-a716-446655440001',
		userId: '550e8400-e29b-41d4-a716-446655440000',
		eventId: '550e8400-e29b-41d4-a716-446655440002',
		status: BookingStatusSchema.enum.CONFIRMED,
		quantity: 2,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
});

export const BookingWithDetailsSchema = BookingSchema.extend({
	user: SafeUserSchema.optional(),
	event: EventSchema.optional(),
});

export type Booking = z.infer<typeof BookingSchema>;
export type BookingWithDetails = z.infer<typeof BookingWithDetailsSchema>;

import { TimeFilterSchema } from './common.schema';

export const BookingFiltersSchema = z.object({
	skip: z.coerce.number().optional(),
	limit: z.coerce.number().optional(),
	status: BookingStatusEnum.optional(),
	search: z.string().optional(),
	time: TimeFilterSchema.optional(),
	eventId: z.string().optional(),
});

export type BookingFilters = z.infer<typeof BookingFiltersSchema>;

// === CREATE BOOKING ===
export const CreateBookingSchema = z.object({
	eventId: z.string().uuid().openapi({
		description: 'Event ID to book',
		example: '550e8400-e29b-41d4-a716-446655440002',
	}),
	quantity: z.number().int().min(1).max(4).default(1).openapi({
		description: 'Number of spots to book (1-4)',
		example: 2,
	}),
});

export type CreateBookingData = z.infer<typeof CreateBookingSchema>;

export type CreateBookingResponse = {
	booking: Booking;
	clientSecret: string | null;
};

// === UPDATE BOOKING ===
export const UpdateBookingSchema = z.object({
	quantity: z.number().int().min(1).max(4).openapi({
		description: 'New number of spots (1-4)',
		example: 3,
	}),
});

export type UpdateBookingData = z.infer<typeof UpdateBookingSchema>;

// === CANCEL BOOKING ===
export const CancelBookingSchema = z.object({
	id: z.string().uuid().openapi({
		description: 'Booking ID to cancel',
		example: '550e8400-e29b-41d4-a716-446655440001',
	}),
});

export type CancelBookingData = z.infer<typeof CancelBookingSchema>;

export const BookingWithEstimateSchema = BookingSchema.extend({
	event: EventSchema.optional(),
	refundPercentage: z.number(),
	estimatedStripeFeeInCents: z.number(),
	estimatedRefundInCents: z.number(),
});

export type BookingWithEstimate = z.infer<typeof BookingWithEstimateSchema>;
