import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { BookingStatusSchema } from '../inputTypeSchemas/BookingStatusSchema'

/////////////////////////////////////////
// BOOKING SCHEMA
/////////////////////////////////////////

export const BookingSchema = z.object({
  status: BookingStatusSchema,
  id: z.uuid(),
  userId: z.string(),
  eventId: z.string(),
  quantity: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'Booking']"}),
  paymentIntentId: z.string().nullable(),
})

export type Booking = z.infer<typeof BookingSchema>

export default BookingSchema;
