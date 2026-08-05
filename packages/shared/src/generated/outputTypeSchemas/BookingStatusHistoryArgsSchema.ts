import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingStatusHistorySelectSchema } from '../inputTypeSchemas/BookingStatusHistorySelectSchema';
import { BookingStatusHistoryIncludeSchema } from '../inputTypeSchemas/BookingStatusHistoryIncludeSchema';

export const BookingStatusHistoryArgsSchema: z.ZodType<Prisma.BookingStatusHistoryDefaultArgs> = z.object({
  select: z.lazy(() => BookingStatusHistorySelectSchema).optional(),
  include: z.lazy(() => BookingStatusHistoryIncludeSchema).optional(),
}).strict();

export default BookingStatusHistoryArgsSchema;
