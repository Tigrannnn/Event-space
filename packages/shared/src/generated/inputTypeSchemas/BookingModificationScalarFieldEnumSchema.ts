import { z } from 'zod';

export const BookingModificationScalarFieldEnumSchema = z.enum(['id','bookingId','fromQuantity','toQuantity','amount','paymentIntentId','status','failureReason','createdAt','updatedAt','appliedAt']);

export default BookingModificationScalarFieldEnumSchema;
