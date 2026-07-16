import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingCreateManyOccurrenceInputSchema } from './BookingCreateManyOccurrenceInputSchema';

export const BookingCreateManyOccurrenceInputEnvelopeSchema: z.ZodType<Prisma.BookingCreateManyOccurrenceInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => BookingCreateManyOccurrenceInputSchema), z.lazy(() => BookingCreateManyOccurrenceInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export default BookingCreateManyOccurrenceInputEnvelopeSchema;
