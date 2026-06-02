import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingArgsSchema } from "../outputTypeSchemas/BookingArgsSchema"

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

export default BookingAdjustmentSelectSchema;
