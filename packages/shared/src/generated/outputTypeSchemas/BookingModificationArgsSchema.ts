import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingModificationSelectSchema } from '../inputTypeSchemas/BookingModificationSelectSchema';
import { BookingModificationIncludeSchema } from '../inputTypeSchemas/BookingModificationIncludeSchema';

export const BookingModificationArgsSchema: z.ZodType<Prisma.BookingModificationDefaultArgs> = z.object({
  select: z.lazy(() => BookingModificationSelectSchema).optional(),
  include: z.lazy(() => BookingModificationIncludeSchema).optional(),
}).strict();

export default BookingModificationArgsSchema;
