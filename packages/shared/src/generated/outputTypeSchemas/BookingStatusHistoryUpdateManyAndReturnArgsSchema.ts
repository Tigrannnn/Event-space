import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingStatusHistoryUpdateManyMutationInputSchema } from '../inputTypeSchemas/BookingStatusHistoryUpdateManyMutationInputSchema'
import { BookingStatusHistoryUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/BookingStatusHistoryUncheckedUpdateManyInputSchema'
import { BookingStatusHistoryWhereInputSchema } from '../inputTypeSchemas/BookingStatusHistoryWhereInputSchema'

export const BookingStatusHistoryUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.BookingStatusHistoryUpdateManyAndReturnArgs> = z.object({
  data: z.union([ BookingStatusHistoryUpdateManyMutationInputSchema, BookingStatusHistoryUncheckedUpdateManyInputSchema ]),
  where: BookingStatusHistoryWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default BookingStatusHistoryUpdateManyAndReturnArgsSchema;
