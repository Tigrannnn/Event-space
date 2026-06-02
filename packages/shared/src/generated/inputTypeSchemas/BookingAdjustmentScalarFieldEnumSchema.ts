import { z } from 'zod';

export const BookingAdjustmentScalarFieldEnumSchema = z.enum(['id','bookingId','type','amount','currency','stripePaymentIntentId','stripeRefundId','status','reason','createdAt','updatedAt']);

export default BookingAdjustmentScalarFieldEnumSchema;
