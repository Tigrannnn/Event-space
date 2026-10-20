import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingModificationUpdateManyMutationInputSchema } from '../inputTypeSchemas/BookingModificationUpdateManyMutationInputSchema'
import { BookingModificationUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/BookingModificationUncheckedUpdateManyInputSchema'
import { BookingModificationWhereInputSchema } from '../inputTypeSchemas/BookingModificationWhereInputSchema'

export const BookingModificationUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.BookingModificationUpdateManyAndReturnArgs> = z.object({
  data: z.union([ BookingModificationUpdateManyMutationInputSchema, BookingModificationUncheckedUpdateManyInputSchema ]),
  where: BookingModificationWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default BookingModificationUpdateManyAndReturnArgsSchema;
