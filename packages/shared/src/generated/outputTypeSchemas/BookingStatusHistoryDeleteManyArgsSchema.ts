import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingStatusHistoryWhereInputSchema } from '../inputTypeSchemas/BookingStatusHistoryWhereInputSchema'

export const BookingStatusHistoryDeleteManyArgsSchema: z.ZodType<Prisma.BookingStatusHistoryDeleteManyArgs> = z.object({
  where: BookingStatusHistoryWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default BookingStatusHistoryDeleteManyArgsSchema;
