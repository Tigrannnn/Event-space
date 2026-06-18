import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingReferenceCreateManyInputSchema } from '../inputTypeSchemas/BookingReferenceCreateManyInputSchema'

export const BookingReferenceCreateManyAndReturnArgsSchema: z.ZodType<Prisma.BookingReferenceCreateManyAndReturnArgs> = z.object({
  data: z.union([ BookingReferenceCreateManyInputSchema, BookingReferenceCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default BookingReferenceCreateManyAndReturnArgsSchema;
