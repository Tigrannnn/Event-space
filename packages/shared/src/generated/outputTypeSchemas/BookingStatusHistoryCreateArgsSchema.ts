import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingStatusHistoryIncludeSchema } from '../inputTypeSchemas/BookingStatusHistoryIncludeSchema'
import { BookingStatusHistoryCreateInputSchema } from '../inputTypeSchemas/BookingStatusHistoryCreateInputSchema'
import { BookingStatusHistoryUncheckedCreateInputSchema } from '../inputTypeSchemas/BookingStatusHistoryUncheckedCreateInputSchema'
import { BookingArgsSchema } from "../outputTypeSchemas/BookingArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const BookingStatusHistorySelectSchema: z.ZodType<Prisma.BookingStatusHistorySelect> = z.object({
  id: z.boolean().optional(),
  bookingId: z.boolean().optional(),
  status: z.boolean().optional(),
  validFrom: z.boolean().optional(),
  validTo: z.boolean().optional(),
  booking: z.union([z.boolean(),z.lazy(() => BookingArgsSchema)]).optional(),
}).strict()

export const BookingStatusHistoryCreateArgsSchema: z.ZodType<Prisma.BookingStatusHistoryCreateArgs> = z.object({
  select: BookingStatusHistorySelectSchema.optional(),
  include: z.lazy(() => BookingStatusHistoryIncludeSchema).optional(),
  data: z.union([ BookingStatusHistoryCreateInputSchema, BookingStatusHistoryUncheckedCreateInputSchema ]),
}).strict();

export default BookingStatusHistoryCreateArgsSchema;
