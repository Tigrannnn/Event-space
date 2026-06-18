import { z } from 'zod';

export const BookingScalarFieldEnumSchema = z.enum(['id','userId','eventId','status','quantity','createdAt','updatedAt','amount','paymentMethod','createdByAdminId','paymentIntentId','referenceNumber','checkedInAt']);

export default BookingScalarFieldEnumSchema;
