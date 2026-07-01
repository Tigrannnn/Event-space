import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventUpdateWithoutOccurrencesInputSchema } from './EventUpdateWithoutOccurrencesInputSchema';
import { EventUncheckedUpdateWithoutOccurrencesInputSchema } from './EventUncheckedUpdateWithoutOccurrencesInputSchema';
import { EventCreateWithoutOccurrencesInputSchema } from './EventCreateWithoutOccurrencesInputSchema';
import { EventUncheckedCreateWithoutOccurrencesInputSchema } from './EventUncheckedCreateWithoutOccurrencesInputSchema';
import { EventWhereInputSchema } from './EventWhereInputSchema';

export const EventUpsertWithoutOccurrencesInputSchema: z.ZodType<Prisma.EventUpsertWithoutOccurrencesInput> = z.object({
  update: z.union([ z.lazy(() => EventUpdateWithoutOccurrencesInputSchema), z.lazy(() => EventUncheckedUpdateWithoutOccurrencesInputSchema) ]),
  create: z.union([ z.lazy(() => EventCreateWithoutOccurrencesInputSchema), z.lazy(() => EventUncheckedCreateWithoutOccurrencesInputSchema) ]),
  where: z.lazy(() => EventWhereInputSchema).optional(),
}).strict();

export default EventUpsertWithoutOccurrencesInputSchema;
