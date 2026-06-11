import { z } from 'zod';

export const BookingScalarFieldEnumSchema = z.enum(['id','userId','eventId','status','quantity','createdAt','updatedAt','expiresAt','amount','paymentIntentId']);

export default BookingScalarFieldEnumSchema;
