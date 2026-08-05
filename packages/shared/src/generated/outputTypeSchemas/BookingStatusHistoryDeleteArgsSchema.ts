import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingStatusHistoryIncludeSchema } from '../inputTypeSchemas/BookingStatusHistoryIncludeSchema'
import { BookingStatusHistoryWhereUniqueInputSchema } from '../inputTypeSchemas/BookingStatusHistoryWhereUniqueInputSchema'
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

export const BookingStatusHistoryDeleteArgsSchema: z.ZodType<Prisma.BookingStatusHistoryDeleteArgs> = z.object({
  select: BookingStatusHistorySelectSchema.optional(),
  include: z.lazy(() => BookingStatusHistoryIncludeSchema).optional(),
  where: BookingStatusHistoryWhereUniqueInputSchema, 
}).strict();

export default BookingStatusHistoryDeleteArgsSchema;
