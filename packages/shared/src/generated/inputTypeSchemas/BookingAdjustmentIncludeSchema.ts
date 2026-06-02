import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingArgsSchema } from "../outputTypeSchemas/BookingArgsSchema"

export const BookingAdjustmentIncludeSchema: z.ZodType<Prisma.BookingAdjustmentInclude> = z.object({
  booking: z.union([z.boolean(),z.lazy(() => BookingArgsSchema)]).optional(),
}).strict();

export default BookingAdjustmentIncludeSchema;
