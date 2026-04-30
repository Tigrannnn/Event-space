import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingSelectSchema } from '../inputTypeSchemas/BookingSelectSchema';
import { BookingIncludeSchema } from '../inputTypeSchemas/BookingIncludeSchema';

export const BookingArgsSchema: z.ZodType<Prisma.BookingDefaultArgs> = z.object({
  select: z.lazy(() => BookingSelectSchema).optional(),
  include: z.lazy(() => BookingIncludeSchema).optional(),
}).strict();

export default BookingArgsSchema;
