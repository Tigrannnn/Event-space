import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingAdjustmentWhereInputSchema } from '../inputTypeSchemas/BookingAdjustmentWhereInputSchema'

export const BookingAdjustmentDeleteManyArgsSchema: z.ZodType<Prisma.BookingAdjustmentDeleteManyArgs> = z.object({
  where: BookingAdjustmentWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default BookingAdjustmentDeleteManyArgsSchema;
