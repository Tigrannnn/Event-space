import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingCreateManyUserInputSchema } from './BookingCreateManyUserInputSchema';

export const BookingCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.BookingCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => BookingCreateManyUserInputSchema), z.lazy(() => BookingCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export default BookingCreateManyUserInputEnvelopeSchema;
