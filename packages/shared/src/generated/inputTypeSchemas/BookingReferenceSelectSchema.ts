import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const BookingReferenceSelectSchema: z.ZodType<Prisma.BookingReferenceSelect> = z.object({
  id: z.boolean().optional(),
  createdAt: z.boolean().optional(),
}).strict()

export default BookingReferenceSelectSchema;
