import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingAdjustmentCreateManyBookingInputSchema } from './BookingAdjustmentCreateManyBookingInputSchema';

export const BookingAdjustmentCreateManyBookingInputEnvelopeSchema: z.ZodType<Prisma.BookingAdjustmentCreateManyBookingInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => BookingAdjustmentCreateManyBookingInputSchema), z.lazy(() => BookingAdjustmentCreateManyBookingInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export default BookingAdjustmentCreateManyBookingInputEnvelopeSchema;
