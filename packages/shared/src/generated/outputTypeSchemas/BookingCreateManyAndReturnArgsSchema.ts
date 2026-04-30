import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingCreateManyInputSchema } from '../inputTypeSchemas/BookingCreateManyInputSchema'

export const BookingCreateManyAndReturnArgsSchema: z.ZodType<Prisma.BookingCreateManyAndReturnArgs> = z.object({
  data: z.union([ BookingCreateManyInputSchema, BookingCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default BookingCreateManyAndReturnArgsSchema;
