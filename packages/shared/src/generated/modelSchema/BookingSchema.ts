import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { BookingStatusSchema } from '../inputTypeSchemas/BookingStatusSchema'
import { PaymentMethodSchema } from '../inputTypeSchemas/PaymentMethodSchema'

/////////////////////////////////////////
// BOOKING SCHEMA
/////////////////////////////////////////

export const BookingSchema = z.object({
  status: BookingStatusSchema,
  paymentMethod: PaymentMethodSchema,
  id: z.uuid(),
  userId: z.string(),
  eventId: z.string(),
  quantity: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'Booking']"}),
  createdByAdminId: z.string().nullable(),
  paymentIntentId: z.string().nullable(),
  referenceNumber: z.number().int().nullable(),
  checkedInAt: z.coerce.date().nullable(),
})

export type Booking = z.infer<typeof BookingSchema>

export default BookingSchema;
