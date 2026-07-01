import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereInputSchema } from './EventWhereInputSchema';
import { EventUpdateWithoutOccurrencesInputSchema } from './EventUpdateWithoutOccurrencesInputSchema';
import { EventUncheckedUpdateWithoutOccurrencesInputSchema } from './EventUncheckedUpdateWithoutOccurrencesInputSchema';

export const EventUpdateToOneWithWhereWithoutOccurrencesInputSchema: z.ZodType<Prisma.EventUpdateToOneWithWhereWithoutOccurrencesInput> = z.object({
  where: z.lazy(() => EventWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => EventUpdateWithoutOccurrencesInputSchema), z.lazy(() => EventUncheckedUpdateWithoutOccurrencesInputSchema) ]),
}).strict();

export default EventUpdateToOneWithWhereWithoutOccurrencesInputSchema;
