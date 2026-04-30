import { z } from './openapi';
import { BookingSchema as GeneratedBookingSchema, BookingStatusSchema } from '../generated';

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

export type Booking = z.infer<typeof BookingSchema>;

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
