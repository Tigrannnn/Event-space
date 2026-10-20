import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingModificationCreateManyInputSchema } from '../inputTypeSchemas/BookingModificationCreateManyInputSchema'

export const BookingModificationCreateManyAndReturnArgsSchema: z.ZodType<Prisma.BookingModificationCreateManyAndReturnArgs> = z.object({
  data: z.union([ BookingModificationCreateManyInputSchema, BookingModificationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default BookingModificationCreateManyAndReturnArgsSchema;
