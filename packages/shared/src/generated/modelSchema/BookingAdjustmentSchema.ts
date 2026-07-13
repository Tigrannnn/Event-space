import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { AdjustmentTypeSchema } from '../inputTypeSchemas/AdjustmentTypeSchema'
import { AdjustmentStatusSchema } from '../inputTypeSchemas/AdjustmentStatusSchema'

/////////////////////////////////////////
// BOOKING ADJUSTMENT SCHEMA
/////////////////////////////////////////

export const BookingAdjustmentSchema = z.object({
  type: AdjustmentTypeSchema,
  status: AdjustmentStatusSchema,
  id: z.string().uuid(),
  bookingId: z.string(),
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'BookingAdjustment']"}),
  currency: z.string(),
  stripePaymentIntentId: z.string().nullable(),
  stripeRefundId: z.string().nullable(),
  reason: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type BookingAdjustment = z.infer<typeof BookingAdjustmentSchema>

export default BookingAdjustmentSchema;
