import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingStatusHistoryCreateManyInputSchema } from '../inputTypeSchemas/BookingStatusHistoryCreateManyInputSchema'

export const BookingStatusHistoryCreateManyAndReturnArgsSchema: z.ZodType<Prisma.BookingStatusHistoryCreateManyAndReturnArgs> = z.object({
  data: z.union([ BookingStatusHistoryCreateManyInputSchema, BookingStatusHistoryCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default BookingStatusHistoryCreateManyAndReturnArgsSchema;
