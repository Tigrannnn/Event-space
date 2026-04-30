import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingWhereInputSchema } from '../inputTypeSchemas/BookingWhereInputSchema'

export const BookingDeleteManyArgsSchema: z.ZodType<Prisma.BookingDeleteManyArgs> = z.object({
  where: BookingWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default BookingDeleteManyArgsSchema;
