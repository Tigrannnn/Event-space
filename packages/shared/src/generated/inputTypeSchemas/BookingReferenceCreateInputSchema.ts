import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const BookingReferenceCreateInputSchema: z.ZodType<Prisma.BookingReferenceCreateInput> = z.strictObject({
  createdAt: z.coerce.date().optional(),
});

export default BookingReferenceCreateInputSchema;
