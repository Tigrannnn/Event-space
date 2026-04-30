import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingUpdateManyMutationInputSchema } from '../inputTypeSchemas/BookingUpdateManyMutationInputSchema'
import { BookingUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/BookingUncheckedUpdateManyInputSchema'
import { BookingWhereInputSchema } from '../inputTypeSchemas/BookingWhereInputSchema'

export const BookingUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.BookingUpdateManyAndReturnArgs> = z.object({
  data: z.union([ BookingUpdateManyMutationInputSchema, BookingUncheckedUpdateManyInputSchema ]),
  where: BookingWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default BookingUpdateManyAndReturnArgsSchema;
