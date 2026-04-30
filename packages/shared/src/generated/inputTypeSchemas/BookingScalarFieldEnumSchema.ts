import { z } from 'zod';

export const BookingScalarFieldEnumSchema = z.enum(['id','userId','eventId','status','createdAt','updatedAt']);

export default BookingScalarFieldEnumSchema;
