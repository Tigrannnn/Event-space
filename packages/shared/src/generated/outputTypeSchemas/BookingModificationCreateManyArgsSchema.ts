import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingModificationCreateManyInputSchema } from '../inputTypeSchemas/BookingModificationCreateManyInputSchema'

export const BookingModificationCreateManyArgsSchema: z.ZodType<Prisma.BookingModificationCreateManyArgs> = z.object({
  data: z.union([ BookingModificationCreateManyInputSchema, BookingModificationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default BookingModificationCreateManyArgsSchema;
