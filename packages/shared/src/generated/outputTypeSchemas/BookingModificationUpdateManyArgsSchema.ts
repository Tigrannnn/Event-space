import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingModificationUpdateManyMutationInputSchema } from '../inputTypeSchemas/BookingModificationUpdateManyMutationInputSchema'
import { BookingModificationUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/BookingModificationUncheckedUpdateManyInputSchema'
import { BookingModificationWhereInputSchema } from '../inputTypeSchemas/BookingModificationWhereInputSchema'

export const BookingModificationUpdateManyArgsSchema: z.ZodType<Prisma.BookingModificationUpdateManyArgs> = z.object({
  data: z.union([ BookingModificationUpdateManyMutationInputSchema, BookingModificationUncheckedUpdateManyInputSchema ]),
  where: BookingModificationWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default BookingModificationUpdateManyArgsSchema;
