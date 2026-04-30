import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingCreateManyEventInputSchema } from './BookingCreateManyEventInputSchema';

export const BookingCreateManyEventInputEnvelopeSchema: z.ZodType<Prisma.BookingCreateManyEventInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => BookingCreateManyEventInputSchema), z.lazy(() => BookingCreateManyEventInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default BookingCreateManyEventInputEnvelopeSchema;
