import { z } from 'zod';

/////////////////////////////////////////
// BOOKING REFERENCE SCHEMA
/////////////////////////////////////////

export const BookingReferenceSchema = z.object({
  id: z.number().int(),
  createdAt: z.coerce.date(),
})

export type BookingReference = z.infer<typeof BookingReferenceSchema>

export default BookingReferenceSchema;
