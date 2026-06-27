import { z } from './openapi';
import { BookingSchema as GeneratedBookingSchema } from '../generated/modelSchema/BookingSchema';
import { BookingStatusSchema } from '../generated/inputTypeSchemas/BookingStatusSchema';
import { EventSchema } from './event.schema';
import { SafeUserSchema } from './user.schema';
import { BookingAdjustmentSchema } from './booking-adjustment.schema';
import { PhoneSchema } from './atoms';

export const BookingStatusEnum = BookingStatusSchema;
export type BookingStatus = z.infer<typeof BookingStatusEnum>;

export const BookingSchema = GeneratedBookingSchema.extend({
	amount: z.number(),
}).openapi({
	description: 'Booking information',
	example: {
		id: '550e8400-e29b-41d4-a716-446655440001',
		userId: '550e8400-e29b-41d4-a716-446655440000',
		eventId: '550e8400-e29b-41d4-a716-446655440002',
		status: BookingStatusSchema.enum.CONFIRMED,
		quantity: 2,
		amount: 50,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
});

export const BookingWithDetailsSchema = BookingSchema.extend({
	user: SafeUserSchema.optional(),
	event: EventSchema.optional(),
	adjustments: z.array(BookingAdjustmentSchema).optional(),
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
	quantity: z.number().int().min(1).default(1).openapi({
		description: 'Number of spots to book',
		example: 2,
	}),
	phone: PhoneSchema.openapi({
		description: 'Phone number of the user (will be saved to profile)',
		example: '+374 99 123 456',
	}),
});

export type CreateBookingData = z.infer<typeof CreateBookingSchema>;

export type CreateBookingResponse = {
	booking: BookingWithEstimate;
	clientSecret: string | null;
};

// === UPDATE BOOKING ===
export const UpdateBookingSchema = z.object({
	quantity: z.number().int().min(1).openapi({
		description: 'New number of spots',
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
	user: SafeUserSchema.optional(),
	adjustments: z.array(BookingAdjustmentSchema).optional(),
	refundPercentage: z.number(),
	estimatedStripeFeeInCents: z.number(),
	estimatedRefundInCents: z.number(),
});

export type BookingWithEstimate = z.infer<typeof BookingWithEstimateSchema>;

// === CREATE MANUAL BOOKING ===
export const CreateManualBookingSchema = z
	.object({
		eventId: z.string().uuid().openapi({ description: 'Event ID to book' }),
		quantity: z.number().int().min(1).default(1).openapi({ description: 'Number of spots to book' }),
		userId: z.string().uuid().optional().openapi({ description: 'Existing user id (optional)' }),
		shadowUserName: z
			.string()
			.min(1)
			.optional()
			.openapi({ description: 'Name for shadow (temporary) user' }),
	})
	.refine((data) => !!data.userId !== !!data.shadowUserName, {
		message: 'Provide either userId or shadowUserName, not both',
	});

export type CreateManualBookingData = z.infer<typeof CreateManualBookingSchema>;
