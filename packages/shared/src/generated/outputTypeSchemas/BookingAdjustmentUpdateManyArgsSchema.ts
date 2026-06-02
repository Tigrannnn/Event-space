import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingAdjustmentUpdateManyMutationInputSchema } from '../inputTypeSchemas/BookingAdjustmentUpdateManyMutationInputSchema'
import { BookingAdjustmentUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/BookingAdjustmentUncheckedUpdateManyInputSchema'
import { BookingAdjustmentWhereInputSchema } from '../inputTypeSchemas/BookingAdjustmentWhereInputSchema'

export const BookingAdjustmentUpdateManyArgsSchema: z.ZodType<Prisma.BookingAdjustmentUpdateManyArgs> = z.object({
  data: z.union([ BookingAdjustmentUpdateManyMutationInputSchema, BookingAdjustmentUncheckedUpdateManyInputSchema ]),
  where: BookingAdjustmentWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default BookingAdjustmentUpdateManyArgsSchema;
