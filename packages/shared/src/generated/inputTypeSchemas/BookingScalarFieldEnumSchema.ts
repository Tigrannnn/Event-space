import { z } from 'zod';

export const BookingScalarFieldEnumSchema = z.enum(['id','userId','occurrenceId','status','expired','quantity','createdAt','updatedAt','amount','paymentMethod','createdByAdminId','paymentIntentId','referenceNumber','checkedInAt']);

export default BookingScalarFieldEnumSchema;
