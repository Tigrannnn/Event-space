import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventOccurrenceCreateManyEventInputSchema } from './EventOccurrenceCreateManyEventInputSchema';

export const EventOccurrenceCreateManyEventInputEnvelopeSchema: z.ZodType<Prisma.EventOccurrenceCreateManyEventInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => EventOccurrenceCreateManyEventInputSchema), z.lazy(() => EventOccurrenceCreateManyEventInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default EventOccurrenceCreateManyEventInputEnvelopeSchema;
