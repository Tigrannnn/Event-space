import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventOccurrenceWhereUniqueInputSchema } from './EventOccurrenceWhereUniqueInputSchema';
import { EventOccurrenceCreateWithoutEventInputSchema } from './EventOccurrenceCreateWithoutEventInputSchema';
import { EventOccurrenceUncheckedCreateWithoutEventInputSchema } from './EventOccurrenceUncheckedCreateWithoutEventInputSchema';

export const EventOccurrenceCreateOrConnectWithoutEventInputSchema: z.ZodType<Prisma.EventOccurrenceCreateOrConnectWithoutEventInput> = z.object({
  where: z.lazy(() => EventOccurrenceWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EventOccurrenceCreateWithoutEventInputSchema), z.lazy(() => EventOccurrenceUncheckedCreateWithoutEventInputSchema) ]),
}).strict();

export default EventOccurrenceCreateOrConnectWithoutEventInputSchema;
