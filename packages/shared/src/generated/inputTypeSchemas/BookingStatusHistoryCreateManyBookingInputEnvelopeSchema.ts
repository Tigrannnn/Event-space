import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusHistoryCreateManyBookingInputSchema } from './BookingStatusHistoryCreateManyBookingInputSchema';

export const BookingStatusHistoryCreateManyBookingInputEnvelopeSchema: z.ZodType<Prisma.BookingStatusHistoryCreateManyBookingInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => BookingStatusHistoryCreateManyBookingInputSchema), z.lazy(() => BookingStatusHistoryCreateManyBookingInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export default BookingStatusHistoryCreateManyBookingInputEnvelopeSchema;
