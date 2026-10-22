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

/**
 * Status as people see it. A checked-in booking stays CONFIRMED in the database — seats, refunds
 * and payments all key off CONFIRMED — but reads as its own status wherever bookings are shown
 * or filtered. CONFIRMED here means paid and not checked in yet.
 */
export const BookingDisplayStatusEnum = z.enum(['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED']);
export type BookingDisplayStatus = z.infer<typeof BookingDisplayStatusEnum>;

export function getBookingDisplayStatus(booking: {
	status: BookingStatus;
	checkedInAt?: Date | string | null;
}): BookingDisplayStatus {
	return booking.status === 'CONFIRMED' && booking.checkedInAt ? 'CHECKED_IN' : booking.status;
}

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
	/** The admin who entered the booking by hand, when there was one. */
	createdByAdmin: z.object({ id: z.string(), name: z.string().nullable() }).nullable().optional(),
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

export const ConfirmBookingManuallySchema = z.object({
	paymentMethod: z
		.enum(['OFFLINE_PAID', 'PAY_ON_ARRIVAL'])
		.default('OFFLINE_PAID')
		.openapi({ description: 'How the client pays: already paid offline, or on arrival' }),
	quantity: z.number().int().min(1).optional().openapi({
		description: 'Number of spots to confirm; defaults to the booked quantity',
		example: 3,
	}),
});

export type ConfirmBookingManuallyData = z.infer<typeof ConfirmBookingManuallySchema>;

export const QuantitySettlementSchema = z.enum(['RULES', 'FULL', 'CARD']);

export type QuantitySettlement = z.infer<typeof QuantitySettlementSchema>;

export const RefundMethodSchema = z.enum(['STRIPE', 'MANUAL']);

export type RefundMethod = z.infer<typeof RefundMethodSchema>;

export const QuantityQuoteRequestSchema = z.object({
	quantity: z.number().int().min(1).openapi({ description: 'New number of guests' }),
	settlement: QuantitySettlementSchema.optional().openapi({
		description: 'Admin only, when removing guests: refund by the cancellation rules or in full',
	}),
	refundMethod: RefundMethodSchema.optional().openapi({
		description: 'Admin only: refund through Stripe, or record a refund the admin made by hand',
	}),
});

export type QuantityQuoteRequest = z.infer<typeof QuantityQuoteRequestSchema>;

export const ChangeQuantitySchema = QuantityQuoteRequestSchema.extend({
	expectedRefundInCents: z.number().int().min(0).optional().openapi({
		description: 'The refund shown to the client. The change is refused if it is not the same any more',
	}),
});

export type ChangeQuantityData = z.infer<typeof ChangeQuantitySchema>;

export const QuantityQuoteSchema = z.object({
	bookingId: z.string(),
	currentQuantity: z.number().int(),
	newQuantity: z.number().int(),
	direction: z.enum(['DECREASE', 'INCREASE']),
	settlement: QuantitySettlementSchema,
	unitPriceInCents: z.number().int(),
	currentAmountInCents: z.number().int(),
	newAmountInCents: z.number().int(),
	dueInCents: z.number().int(),
	refund: z
		.object({
			method: RefundMethodSchema,
			percentage: z.number(),
			grossInCents: z.number().int(),
			feeInCents: z.number().int(),
			netInCents: z.number().int(),
		})
		.nullable(),
});

export type QuantityQuote = z.infer<typeof QuantityQuoteSchema>;

export const QuantityPaymentStatusSchema = z.enum(['PENDING', 'APPLIED', 'FAILED', 'CANCELLED']);

export type QuantityPaymentStatus = z.infer<typeof QuantityPaymentStatusSchema>;

export const StartQuantityPaymentSchema = z.object({
	paymentIntentId: z.string(),
	clientSecret: z.string(),
	quote: QuantityQuoteSchema,
});

export type StartQuantityPayment = z.infer<typeof StartQuantityPaymentSchema>;

export const QuantityPaymentResultSchema = z.object({
	paymentIntentId: z.string(),
	status: QuantityPaymentStatusSchema,
});

export type QuantityPaymentResult = z.infer<typeof QuantityPaymentResultSchema>;

export const BookingQuantityChangeSchema = z.object({
	bookingId: z.string(),
	quantity: z.number().int(),
	amount: z.number(),
	quote: QuantityQuoteSchema,
});

export type BookingQuantityChange = z.infer<typeof BookingQuantityChangeSchema>;

export const AdminCancelBookingSchema = z.object({
	refundType: z.enum(['FULL', 'RULES']).default('RULES').openapi({
		description: 'Refund by the cancellation rules or in full',
		example: 'RULES',
	}),
	refundMethod: RefundMethodSchema.default('STRIPE').openapi({
		description: 'Refund through Stripe, or record a refund the admin made by hand',
		example: 'STRIPE',
	}),
	reason: z.string().optional().openapi({
		description: 'Optional admin note for the cancellation',
		example: 'Customer requested cancellation',
	}),
});

export type AdminCancelBookingData = z.input<typeof AdminCancelBookingSchema>;

export const BookingAuthorSchema = z.enum(['client', 'admin']);

export type BookingAuthor = z.infer<typeof BookingAuthorSchema>;

export const BookingFiltersSchema = z.object({
	skip: z.coerce.number().optional(),
	limit: z.coerce.number().optional(),
	status: BookingDisplayStatusEnum.optional(),
	search: z.string().optional(),
	/** Filters by the date of the event, not by when the booking was made. */
	time: TimeFilterSchema.optional(),
	eventId: z.string().optional(),
	/** Filters down to a single date of that event. */
	occurrenceId: z.string().optional(),
	/** Filters by when the booking was created — the question `time` cannot answer. */
	createdFrom: DateOnlySchema.optional(),
	createdTo: DateOnlySchema.optional(),
	/** Filters by the date of the tour itself. */
	tourFrom: DateOnlySchema.optional(),
	tourTo: DateOnlySchema.optional(),
	paymentMethod: PaymentMethodSchema.optional(),
	/** Who made the booking: the guest on the site, or an admin by hand. */
	createdBy: BookingAuthorSchema.optional(),
});

export type BookingFilters = z.infer<typeof BookingFiltersSchema>;

export type CreateBookingResponse = {
	booking: BookingWithOccurrence;
	clientSecret: string | null;
	paymentUrl?: string | null;
};

export const BookingWithEstimateSchema = BookingWithDetailsSchema.extend({
	refundPercentage: z.number().openapi({ example: 80 }),
	refundReason: z.enum(['RULES', 'RESCHEDULE']).openapi({
		description: 'RESCHEDULE while the client may still walk away from a date the company moved',
		example: 'RULES',
	}),
	estimatedStripeFeeInCents: z.number().openapi({ example: 350 }),
	estimatedRefundInCents: z.number().openapi({ example: 8650 }),
});

export type BookingWithEstimate = z.infer<typeof BookingWithEstimateSchema>;
