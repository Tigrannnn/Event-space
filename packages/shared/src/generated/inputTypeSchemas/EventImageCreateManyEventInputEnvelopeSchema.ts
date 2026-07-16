import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventImageCreateManyEventInputSchema } from './EventImageCreateManyEventInputSchema';

export const EventImageCreateManyEventInputEnvelopeSchema: z.ZodType<Prisma.EventImageCreateManyEventInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => EventImageCreateManyEventInputSchema), z.lazy(() => EventImageCreateManyEventInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export default EventImageCreateManyEventInputEnvelopeSchema;
