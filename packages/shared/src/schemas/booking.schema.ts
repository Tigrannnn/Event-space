import { z } from './openapi';
import { BookingSchema as GeneratedBookingSchema } from '../generated/modelSchema/BookingSchema';
import { BookingStatusSchema } from '../generated/inputTypeSchemas/BookingStatusSchema';
import { EventSchema } from './event.schema';
import { EventOccurrenceSchema } from './event-occurrence.schema';
import { SafeUserSchema } from './user.schema';
import { BookingAdjustmentSchema } from './booking-adjustment.schema';
import { PhoneSchema, EmailSchema } from './atoms';
import { DateOnlySchema, TimeFilterSchema } from './common.schema';
import { PaymentMethodSchema } from '../generated/inputTypeSchemas/PaymentMethodSchema';

export const BookingStatusEnum = BookingStatusSchema;
export type BookingStatus = z.infer<typeof BookingStatusEnum>;

export const PaymentMethodEnum = PaymentMethodSchema;
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

export const BookingSchema = GeneratedBookingSchema.extend({
	amount: z.number(),
}).openapi({
	description: 'Booking base information',
	example: {
		id: '550e8400-e29b-41d4-a716-446655440001',
		userId: '550e8400-e29b-41d4-a716-446655440000',
		occurrenceId: '550e8400-e29b-41d4-a716-446655440003',
		status: BookingStatusSchema.enum.CONFIRMED,
		quantity: 2,
		amount: 9000,
		paymentIntentId: '987654321',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
});

export type Booking = z.infer<typeof BookingSchema>;

export const BookingWithOccurrenceSchema = BookingSchema.extend({
	occurrence: EventOccurrenceSchema.extend({
		event: EventSchema,
	}).optional(),
});

export type BookingWithOccurrence = z.infer<typeof BookingWithOccurrenceSchema>;

export const BookingWithDetailsSchema = BookingWithOccurrenceSchema.extend({
	occurrence: EventOccurrenceSchema.extend({
		event: EventSchema,
	}).optional(),
	user: SafeUserSchema.optional(),
	adjustments: z.array(BookingAdjustmentSchema).optional(),
});

export type BookingWithDetails = z.infer<typeof BookingWithDetailsSchema>;

export const CreateBookingSchema = z.object({
	occurrenceId: z.string().uuid().openapi({
		description: 'Event occurrence ID to book',
		example: '550e8400-e29b-41d4-a716-446655440003',
	}),
	quantity: z.number().int().min(1).default(1).openapi({
		description: 'Number of spots to book',
		example: 2,
	}),
	phone: PhoneSchema.openapi({
		description: 'Phone number of the user',
		example: '+374 99 123 456',
	}),
	paymentMethod: z.enum(['STRIPE', 'AMERIA', 'IDRAM']).default('STRIPE').openapi({
		description: 'Selected payment method for the booking',
		example: 'AMERIA',
	}),
});

export type CreateBookingData = z.infer<typeof CreateBookingSchema>;

export const UpdateBookingSchema = z.object({
	quantity: z.number().int().min(1).openapi({
		description: 'New number of spots',
		example: 3,
	}),
});

export type UpdateBookingData = z.infer<typeof UpdateBookingSchema>;

export const CancelBookingSchema = z.object({
	id: z.string().uuid().openapi({
		description: 'Booking ID to cancel',
	}),
});

export type CancelBookingData = z.infer<typeof CancelBookingSchema>;

export const CreateManualBookingSchema = z
	.object({
		occurrenceId: z.string().uuid().openapi({ description: 'Event occurrence ID to book' }),
		quantity: z.number().int().min(1).default(1).openapi({ description: 'Number of spots to book' }),
		userId: z.string().uuid().optional().openapi({ description: 'Existing user ID' }),
		name: z.string().min(1).optional().openapi({ description: 'Name for user' }),
		phone: PhoneSchema.optional().openapi({ description: 'Phone number for the user (optional for existing user)' }),
		email: EmailSchema.optional().openapi({ description: 'Email for the user (optional)' }),
		paymentMethod: z
			.enum(['OFFLINE_PAID', 'PAY_ON_ARRIVAL'])
			.default('OFFLINE_PAID')
			.openapi({ description: 'Payment channel for the booking (admin selection excludes site payments)' }),
	})
	.refine((data) => !!data.userId !== !!data.name, {
		message: 'Provide either userId or name, not both',
	})
	.refine((data) => {
		if (data.name) return !!data.phone;
		return true;
	}, { message: 'Phone is required when creating a shadow user' });

export type CreateManualBookingData = z.infer<typeof CreateManualBookingSchema>;

export const AdminCancelBookingSchema = z.object({
	refundType: z.enum(['FULL', 'RULES', 'MANUAL']).default('RULES').openapi({
		description: 'Refund strategy for admin cancellation',
		example: 'RULES',
	}),
	reason: z.string().optional().openapi({
		description: 'Optional admin note for the cancellation',
		example: 'Customer requested cancellation',
	}),
});

export type AdminCancelBookingData = z.infer<typeof AdminCancelBookingSchema>;

export const BookingFiltersSchema = z.object({
	skip: z.coerce.number().optional(),
	limit: z.coerce.number().optional(),
	status: BookingStatusEnum.optional(),
	search: z.string().optional(),
	/** Filters by the date of the event, not by when the booking was made. */
	time: TimeFilterSchema.optional(),
	eventId: z.string().optional(),
	/** Filters by when the booking was created — the question `time` cannot answer. */
	createdFrom: DateOnlySchema.optional(),
	createdTo: DateOnlySchema.optional(),
	paymentMethod: PaymentMethodSchema.optional(),
});

export type BookingFilters = z.infer<typeof BookingFiltersSchema>;

export type CreateBookingResponse = {
	booking: BookingWithOccurrence;
	clientSecret: string | null;
	paymentUrl?: string | null;
};

export const BookingWithEstimateSchema = BookingWithDetailsSchema.extend({
	refundPercentage: z.number().openapi({ example: 80 }),
	estimatedStripeFeeInCents: z.number().openapi({ example: 350 }),
	estimatedRefundInCents: z.number().openapi({ example: 8650 }),
});

export type BookingWithEstimate = z.infer<typeof BookingWithEstimateSchema>;
