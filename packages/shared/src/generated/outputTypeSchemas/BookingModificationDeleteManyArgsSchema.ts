import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingModificationWhereInputSchema } from '../inputTypeSchemas/BookingModificationWhereInputSchema'

export const BookingModificationDeleteManyArgsSchema: z.ZodType<Prisma.BookingModificationDeleteManyArgs> = z.object({
  where: BookingModificationWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default BookingModificationDeleteManyArgsSchema;
