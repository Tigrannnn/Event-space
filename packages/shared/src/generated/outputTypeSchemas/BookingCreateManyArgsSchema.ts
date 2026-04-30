import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingCreateManyInputSchema } from '../inputTypeSchemas/BookingCreateManyInputSchema'

export const BookingCreateManyArgsSchema: z.ZodType<Prisma.BookingCreateManyArgs> = z.object({
  data: z.union([ BookingCreateManyInputSchema, BookingCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default BookingCreateManyArgsSchema;
