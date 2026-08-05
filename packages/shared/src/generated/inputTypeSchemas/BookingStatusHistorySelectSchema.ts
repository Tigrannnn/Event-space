import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingArgsSchema } from "../outputTypeSchemas/BookingArgsSchema"

export const BookingStatusHistorySelectSchema: z.ZodType<Prisma.BookingStatusHistorySelect> = z.object({
  id: z.boolean().optional(),
  bookingId: z.boolean().optional(),
  status: z.boolean().optional(),
  validFrom: z.boolean().optional(),
  validTo: z.boolean().optional(),
  booking: z.union([z.boolean(),z.lazy(() => BookingArgsSchema)]).optional(),
}).strict()

export default BookingStatusHistorySelectSchema;
