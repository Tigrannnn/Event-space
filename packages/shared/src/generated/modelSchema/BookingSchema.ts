import { z } from 'zod';
import { BookingStatusSchema } from '../inputTypeSchemas/BookingStatusSchema'

/////////////////////////////////////////
// BOOKING SCHEMA
/////////////////////////////////////////

export const BookingSchema = z.object({
  status: BookingStatusSchema,
  id: z.string().uuid(),
  userId: z.string(),
  eventId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Booking = z.infer<typeof BookingSchema>

export default BookingSchema;
