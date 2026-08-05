import { z } from 'zod';
import { BookingStatusSchema } from '../inputTypeSchemas/BookingStatusSchema'

/////////////////////////////////////////
// BOOKING STATUS HISTORY SCHEMA
/////////////////////////////////////////

/**
 * Ведётся триггером Postgres (см. миграцию add_booking_status_history), не кодом приложения.
 * SCD Type 2: одна строка на период жизни брони в статусе, valid_to = NULL — текущий статус.
 */
export const BookingStatusHistorySchema = z.object({
  status: BookingStatusSchema,
  id: z.number().int(),
  bookingId: z.string(),
  validFrom: z.coerce.date(),
  validTo: z.coerce.date().nullable(),
})

export type BookingStatusHistory = z.infer<typeof BookingStatusHistorySchema>

export default BookingStatusHistorySchema;
