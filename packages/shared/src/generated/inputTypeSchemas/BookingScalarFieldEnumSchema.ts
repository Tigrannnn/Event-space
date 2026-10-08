import { z } from 'zod';

export const BookingScalarFieldEnumSchema = z.enum(['id','userId','occurrenceId','status','quantity','createdAt','updatedAt','amount','paymentMethod','createdByAdminId','brandHost','paymentIntentId','referenceNumber','checkedInAt','confirmationSentAt']);

export default BookingScalarFieldEnumSchema;
