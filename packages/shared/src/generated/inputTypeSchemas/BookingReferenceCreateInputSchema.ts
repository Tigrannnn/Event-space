import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const BookingReferenceCreateInputSchema: z.ZodType<Prisma.BookingReferenceCreateInput> = z.object({
  createdAt: z.coerce.date().optional(),
}).strict();

export default BookingReferenceCreateInputSchema;
