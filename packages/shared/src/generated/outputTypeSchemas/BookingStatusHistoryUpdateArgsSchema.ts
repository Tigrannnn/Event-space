import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingStatusHistoryIncludeSchema } from '../inputTypeSchemas/BookingStatusHistoryIncludeSchema'
import { BookingStatusHistoryUpdateInputSchema } from '../inputTypeSchemas/BookingStatusHistoryUpdateInputSchema'
import { BookingStatusHistoryUncheckedUpdateInputSchema } from '../inputTypeSchemas/BookingStatusHistoryUncheckedUpdateInputSchema'
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

export const BookingStatusHistoryUpdateArgsSchema: z.ZodType<Prisma.BookingStatusHistoryUpdateArgs> = z.object({
  select: BookingStatusHistorySelectSchema.optional(),
  include: z.lazy(() => BookingStatusHistoryIncludeSchema).optional(),
  data: z.union([ BookingStatusHistoryUpdateInputSchema, BookingStatusHistoryUncheckedUpdateInputSchema ]),
  where: BookingStatusHistoryWhereUniqueInputSchema, 
}).strict();

export default BookingStatusHistoryUpdateArgsSchema;
