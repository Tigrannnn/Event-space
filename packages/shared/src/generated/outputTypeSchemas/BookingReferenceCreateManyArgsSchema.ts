import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingReferenceCreateManyInputSchema } from '../inputTypeSchemas/BookingReferenceCreateManyInputSchema'

export const BookingReferenceCreateManyArgsSchema: z.ZodType<Prisma.BookingReferenceCreateManyArgs> = z.object({
  data: z.union([ BookingReferenceCreateManyInputSchema, BookingReferenceCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default BookingReferenceCreateManyArgsSchema;
