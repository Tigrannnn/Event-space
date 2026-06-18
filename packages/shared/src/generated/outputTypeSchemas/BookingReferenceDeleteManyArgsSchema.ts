import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingReferenceWhereInputSchema } from '../inputTypeSchemas/BookingReferenceWhereInputSchema'

export const BookingReferenceDeleteManyArgsSchema: z.ZodType<Prisma.BookingReferenceDeleteManyArgs> = z.object({
  where: BookingReferenceWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default BookingReferenceDeleteManyArgsSchema;
