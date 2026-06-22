import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereInputSchema } from './EventWhereInputSchema';
import { EventUpdateWithoutTranslationsInputSchema } from './EventUpdateWithoutTranslationsInputSchema';
import { EventUncheckedUpdateWithoutTranslationsInputSchema } from './EventUncheckedUpdateWithoutTranslationsInputSchema';

export const EventUpdateToOneWithWhereWithoutTranslationsInputSchema: z.ZodType<Prisma.EventUpdateToOneWithWhereWithoutTranslationsInput> = z.object({
  where: z.lazy(() => EventWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => EventUpdateWithoutTranslationsInputSchema), z.lazy(() => EventUncheckedUpdateWithoutTranslationsInputSchema) ]),
}).strict();

export default EventUpdateToOneWithWhereWithoutTranslationsInputSchema;
