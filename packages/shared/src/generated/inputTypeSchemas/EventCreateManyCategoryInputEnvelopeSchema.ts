import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateManyCategoryInputSchema } from './EventCreateManyCategoryInputSchema';

export const EventCreateManyCategoryInputEnvelopeSchema: z.ZodType<Prisma.EventCreateManyCategoryInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => EventCreateManyCategoryInputSchema), z.lazy(() => EventCreateManyCategoryInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default EventCreateManyCategoryInputEnvelopeSchema;
