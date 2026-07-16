import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventOccurrenceWhereUniqueInputSchema } from './EventOccurrenceWhereUniqueInputSchema';
import { EventOccurrenceUpdateWithoutEventInputSchema } from './EventOccurrenceUpdateWithoutEventInputSchema';
import { EventOccurrenceUncheckedUpdateWithoutEventInputSchema } from './EventOccurrenceUncheckedUpdateWithoutEventInputSchema';
import { EventOccurrenceCreateWithoutEventInputSchema } from './EventOccurrenceCreateWithoutEventInputSchema';
import { EventOccurrenceUncheckedCreateWithoutEventInputSchema } from './EventOccurrenceUncheckedCreateWithoutEventInputSchema';

export const EventOccurrenceUpsertWithWhereUniqueWithoutEventInputSchema: z.ZodType<Prisma.EventOccurrenceUpsertWithWhereUniqueWithoutEventInput> = z.strictObject({
  where: z.lazy(() => EventOccurrenceWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => EventOccurrenceUpdateWithoutEventInputSchema), z.lazy(() => EventOccurrenceUncheckedUpdateWithoutEventInputSchema) ]),
  create: z.union([ z.lazy(() => EventOccurrenceCreateWithoutEventInputSchema), z.lazy(() => EventOccurrenceUncheckedCreateWithoutEventInputSchema) ]),
});

export default EventOccurrenceUpsertWithWhereUniqueWithoutEventInputSchema;
