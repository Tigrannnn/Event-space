import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingAdjustmentIncludeSchema } from '../inputTypeSchemas/BookingAdjustmentIncludeSchema'
import { BookingAdjustmentWhereUniqueInputSchema } from '../inputTypeSchemas/BookingAdjustmentWhereUniqueInputSchema'
import { BookingArgsSchema } from "../outputTypeSchemas/BookingArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const BookingAdjustmentSelectSchema: z.ZodType<Prisma.BookingAdjustmentSelect> = z.object({
  id: z.boolean().optional(),
  bookingId: z.boolean().optional(),
  type: z.boolean().optional(),
  amount: z.boolean().optional(),
  currency: z.boolean().optional(),
  stripePaymentIntentId: z.boolean().optional(),
  stripeRefundId: z.boolean().optional(),
  status: z.boolean().optional(),
  reason: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  booking: z.union([z.boolean(),z.lazy(() => BookingArgsSchema)]).optional(),
}).strict()

export const BookingAdjustmentDeleteArgsSchema: z.ZodType<Prisma.BookingAdjustmentDeleteArgs> = z.object({
  select: BookingAdjustmentSelectSchema.optional(),
  include: z.lazy(() => BookingAdjustmentIncludeSchema).optional(),
  where: BookingAdjustmentWhereUniqueInputSchema, 
}).strict();

export default BookingAdjustmentDeleteArgsSchema;
