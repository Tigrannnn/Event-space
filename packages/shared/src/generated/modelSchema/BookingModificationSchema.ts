import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { ModificationStatusSchema } from '../inputTypeSchemas/ModificationStatusSchema'

/////////////////////////////////////////
// BOOKING MODIFICATION SCHEMA
/////////////////////////////////////////

export const BookingModificationSchema = z.object({
  status: ModificationStatusSchema,
  id: z.uuid(),
  bookingId: z.string(),
  fromQuantity: z.number().int(),
  toQuantity: z.number().int(),
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'BookingModification']"}),
  paymentIntentId: z.string().nullable(),
  failureReason: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  appliedAt: z.coerce.date().nullable(),
})

export type BookingModification = z.infer<typeof BookingModificationSchema>

export default BookingModificationSchema;
