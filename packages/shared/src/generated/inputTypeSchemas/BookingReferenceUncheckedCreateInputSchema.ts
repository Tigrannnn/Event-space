import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const BookingReferenceUncheckedCreateInputSchema: z.ZodType<Prisma.BookingReferenceUncheckedCreateInput> = z.strictObject({
  id: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
});

export default BookingReferenceUncheckedCreateInputSchema;
