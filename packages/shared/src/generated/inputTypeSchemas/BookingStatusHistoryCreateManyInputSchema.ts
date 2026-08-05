import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusSchema } from './BookingStatusSchema';

export const BookingStatusHistoryCreateManyInputSchema: z.ZodType<Prisma.BookingStatusHistoryCreateManyInput> = z.strictObject({
  id: z.number().int().optional(),
  bookingId: z.string(),
  status: z.lazy(() => BookingStatusSchema),
  validFrom: z.coerce.date().optional(),
  validTo: z.coerce.date().optional().nullable(),
});

export default BookingStatusHistoryCreateManyInputSchema;
