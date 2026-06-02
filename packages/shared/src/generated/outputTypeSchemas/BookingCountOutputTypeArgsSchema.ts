import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingCountOutputTypeSelectSchema } from './BookingCountOutputTypeSelectSchema';

export const BookingCountOutputTypeArgsSchema: z.ZodType<Prisma.BookingCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => BookingCountOutputTypeSelectSchema).nullish(),
}).strict();

export default BookingCountOutputTypeSelectSchema;
