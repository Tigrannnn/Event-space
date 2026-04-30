import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateManyOrganizerInputSchema } from './EventCreateManyOrganizerInputSchema';

export const EventCreateManyOrganizerInputEnvelopeSchema: z.ZodType<Prisma.EventCreateManyOrganizerInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => EventCreateManyOrganizerInputSchema), z.lazy(() => EventCreateManyOrganizerInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default EventCreateManyOrganizerInputEnvelopeSchema;
