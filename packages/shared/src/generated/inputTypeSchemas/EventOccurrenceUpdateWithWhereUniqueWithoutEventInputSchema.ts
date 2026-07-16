import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventOccurrenceWhereUniqueInputSchema } from './EventOccurrenceWhereUniqueInputSchema';
import { EventOccurrenceUpdateWithoutEventInputSchema } from './EventOccurrenceUpdateWithoutEventInputSchema';
import { EventOccurrenceUncheckedUpdateWithoutEventInputSchema } from './EventOccurrenceUncheckedUpdateWithoutEventInputSchema';

export const EventOccurrenceUpdateWithWhereUniqueWithoutEventInputSchema: z.ZodType<Prisma.EventOccurrenceUpdateWithWhereUniqueWithoutEventInput> = z.strictObject({
  where: z.lazy(() => EventOccurrenceWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => EventOccurrenceUpdateWithoutEventInputSchema), z.lazy(() => EventOccurrenceUncheckedUpdateWithoutEventInputSchema) ]),
});

export default EventOccurrenceUpdateWithWhereUniqueWithoutEventInputSchema;
