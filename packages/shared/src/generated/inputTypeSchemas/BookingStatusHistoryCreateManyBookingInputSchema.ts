import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusSchema } from './BookingStatusSchema';

export const BookingStatusHistoryCreateManyBookingInputSchema: z.ZodType<Prisma.BookingStatusHistoryCreateManyBookingInput> = z.strictObject({
  id: z.number().int().optional(),
  status: z.lazy(() => BookingStatusSchema),
  validFrom: z.coerce.date().optional(),
  validTo: z.coerce.date().optional().nullable(),
});

export default BookingStatusHistoryCreateManyBookingInputSchema;
