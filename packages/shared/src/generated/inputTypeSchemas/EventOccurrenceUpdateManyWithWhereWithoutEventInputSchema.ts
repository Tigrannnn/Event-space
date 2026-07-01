import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventOccurrenceScalarWhereInputSchema } from './EventOccurrenceScalarWhereInputSchema';
import { EventOccurrenceUpdateManyMutationInputSchema } from './EventOccurrenceUpdateManyMutationInputSchema';
import { EventOccurrenceUncheckedUpdateManyWithoutEventInputSchema } from './EventOccurrenceUncheckedUpdateManyWithoutEventInputSchema';

export const EventOccurrenceUpdateManyWithWhereWithoutEventInputSchema: z.ZodType<Prisma.EventOccurrenceUpdateManyWithWhereWithoutEventInput> = z.object({
  where: z.lazy(() => EventOccurrenceScalarWhereInputSchema),
  data: z.union([ z.lazy(() => EventOccurrenceUpdateManyMutationInputSchema), z.lazy(() => EventOccurrenceUncheckedUpdateManyWithoutEventInputSchema) ]),
}).strict();

export default EventOccurrenceUpdateManyWithWhereWithoutEventInputSchema;
