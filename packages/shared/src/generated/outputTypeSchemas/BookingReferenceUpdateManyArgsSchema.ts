import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingReferenceUpdateManyMutationInputSchema } from '../inputTypeSchemas/BookingReferenceUpdateManyMutationInputSchema'
import { BookingReferenceUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/BookingReferenceUncheckedUpdateManyInputSchema'
import { BookingReferenceWhereInputSchema } from '../inputTypeSchemas/BookingReferenceWhereInputSchema'

export const BookingReferenceUpdateManyArgsSchema: z.ZodType<Prisma.BookingReferenceUpdateManyArgs> = z.object({
  data: z.union([ BookingReferenceUpdateManyMutationInputSchema, BookingReferenceUncheckedUpdateManyInputSchema ]),
  where: BookingReferenceWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default BookingReferenceUpdateManyArgsSchema;
