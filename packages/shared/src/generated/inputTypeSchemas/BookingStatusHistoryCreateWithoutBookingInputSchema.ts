import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusSchema } from './BookingStatusSchema';

export const BookingStatusHistoryCreateWithoutBookingInputSchema: z.ZodType<Prisma.BookingStatusHistoryCreateWithoutBookingInput> = z.strictObject({
  status: z.lazy(() => BookingStatusSchema),
  validFrom: z.coerce.date().optional(),
  validTo: z.coerce.date().optional().nullable(),
});

export default BookingStatusHistoryCreateWithoutBookingInputSchema;
