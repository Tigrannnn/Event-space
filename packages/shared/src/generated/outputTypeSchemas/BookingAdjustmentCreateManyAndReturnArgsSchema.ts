import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingAdjustmentCreateManyInputSchema } from '../inputTypeSchemas/BookingAdjustmentCreateManyInputSchema'

export const BookingAdjustmentCreateManyAndReturnArgsSchema: z.ZodType<Prisma.BookingAdjustmentCreateManyAndReturnArgs> = z.object({
  data: z.union([ BookingAdjustmentCreateManyInputSchema, BookingAdjustmentCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default BookingAdjustmentCreateManyAndReturnArgsSchema;
