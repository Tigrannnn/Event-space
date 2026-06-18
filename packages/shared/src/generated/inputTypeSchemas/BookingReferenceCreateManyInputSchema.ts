import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const BookingReferenceCreateManyInputSchema: z.ZodType<Prisma.BookingReferenceCreateManyInput> = z.object({
  id: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
}).strict();

export default BookingReferenceCreateManyInputSchema;
