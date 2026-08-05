import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingStatusHistoryUpdateManyMutationInputSchema } from '../inputTypeSchemas/BookingStatusHistoryUpdateManyMutationInputSchema'
import { BookingStatusHistoryUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/BookingStatusHistoryUncheckedUpdateManyInputSchema'
import { BookingStatusHistoryWhereInputSchema } from '../inputTypeSchemas/BookingStatusHistoryWhereInputSchema'

export const BookingStatusHistoryUpdateManyArgsSchema: z.ZodType<Prisma.BookingStatusHistoryUpdateManyArgs> = z.object({
  data: z.union([ BookingStatusHistoryUpdateManyMutationInputSchema, BookingStatusHistoryUncheckedUpdateManyInputSchema ]),
  where: BookingStatusHistoryWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default BookingStatusHistoryUpdateManyArgsSchema;
