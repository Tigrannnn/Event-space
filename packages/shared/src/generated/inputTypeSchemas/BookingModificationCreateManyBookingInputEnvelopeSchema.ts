import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingModificationCreateManyBookingInputSchema } from './BookingModificationCreateManyBookingInputSchema';

export const BookingModificationCreateManyBookingInputEnvelopeSchema: z.ZodType<Prisma.BookingModificationCreateManyBookingInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => BookingModificationCreateManyBookingInputSchema), z.lazy(() => BookingModificationCreateManyBookingInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export default BookingModificationCreateManyBookingInputEnvelopeSchema;
