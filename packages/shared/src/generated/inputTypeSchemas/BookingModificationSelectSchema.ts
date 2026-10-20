import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingArgsSchema } from "../outputTypeSchemas/BookingArgsSchema"

export const BookingModificationSelectSchema: z.ZodType<Prisma.BookingModificationSelect> = z.object({
  id: z.boolean().optional(),
  bookingId: z.boolean().optional(),
  fromQuantity: z.boolean().optional(),
  toQuantity: z.boolean().optional(),
  amount: z.boolean().optional(),
  paymentIntentId: z.boolean().optional(),
  status: z.boolean().optional(),
  failureReason: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  appliedAt: z.boolean().optional(),
  booking: z.union([z.boolean(),z.lazy(() => BookingArgsSchema)]).optional(),
}).strict()

export default BookingModificationSelectSchema;
