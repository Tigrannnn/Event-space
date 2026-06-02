import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingAdjustmentSelectSchema } from '../inputTypeSchemas/BookingAdjustmentSelectSchema';
import { BookingAdjustmentIncludeSchema } from '../inputTypeSchemas/BookingAdjustmentIncludeSchema';

export const BookingAdjustmentArgsSchema: z.ZodType<Prisma.BookingAdjustmentDefaultArgs> = z.object({
  select: z.lazy(() => BookingAdjustmentSelectSchema).optional(),
  include: z.lazy(() => BookingAdjustmentIncludeSchema).optional(),
}).strict();

export default BookingAdjustmentArgsSchema;
