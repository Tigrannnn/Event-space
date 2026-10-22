import { z } from 'zod';

export const BookingScalarFieldEnumSchema = z.enum(['id','userId','occurrenceId','status','quantity','createdAt','updatedAt','amount','paymentMethod','createdByAdminId','rescheduleRefundUntil','brandHost','paymentIntentId','referenceNumber','checkedInAt','confirmationSentAt','reminderSentAt']);

export default BookingScalarFieldEnumSchema;
