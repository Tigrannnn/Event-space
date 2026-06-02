import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingAdjustmentIncludeSchema } from '../inputTypeSchemas/BookingAdjustmentIncludeSchema'
import { BookingAdjustmentCreateInputSchema } from '../inputTypeSchemas/BookingAdjustmentCreateInputSchema'
import { BookingAdjustmentUncheckedCreateInputSchema } from '../inputTypeSchemas/BookingAdjustmentUncheckedCreateInputSchema'
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

export const BookingAdjustmentCreateArgsSchema: z.ZodType<Prisma.BookingAdjustmentCreateArgs> = z.object({
  select: BookingAdjustmentSelectSchema.optional(),
  include: z.lazy(() => BookingAdjustmentIncludeSchema).optional(),
  data: z.union([ BookingAdjustmentCreateInputSchema, BookingAdjustmentUncheckedCreateInputSchema ]),
}).strict();

export default BookingAdjustmentCreateArgsSchema;
