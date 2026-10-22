import { z } from 'zod';
import { BookingStatusSchema } from '../inputTypeSchemas/BookingStatusSchema'

/////////////////////////////////////////
// BOOKING STATUS HISTORY SCHEMA
/////////////////////////////////////////

export const BookingStatusHistorySchema = z.object({
  status: BookingStatusSchema,
  id: z.number().int(),
  bookingId: z.string(),
  validFrom: z.coerce.date(),
  validTo: z.coerce.date().nullable(),
})

export type BookingStatusHistory = z.infer<typeof BookingStatusHistorySchema>

export default BookingStatusHistorySchema;
