import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const BookingCountOutputTypeSelectSchema: z.ZodType<Prisma.BookingCountOutputTypeSelect> = z.object({
  adjustments: z.boolean().optional(),
}).strict();

export default BookingCountOutputTypeSelectSchema;
