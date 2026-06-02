import { z } from 'zod';

export const BookingScalarFieldEnumSchema = z.enum(['id','userId','eventId','status','quantity','createdAt','updatedAt','amount','paymentIntentId']);

export default BookingScalarFieldEnumSchema;
