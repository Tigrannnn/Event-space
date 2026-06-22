import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventUpdateWithoutTranslationsInputSchema } from './EventUpdateWithoutTranslationsInputSchema';
import { EventUncheckedUpdateWithoutTranslationsInputSchema } from './EventUncheckedUpdateWithoutTranslationsInputSchema';
import { EventCreateWithoutTranslationsInputSchema } from './EventCreateWithoutTranslationsInputSchema';
import { EventUncheckedCreateWithoutTranslationsInputSchema } from './EventUncheckedCreateWithoutTranslationsInputSchema';
import { EventWhereInputSchema } from './EventWhereInputSchema';

export const EventUpsertWithoutTranslationsInputSchema: z.ZodType<Prisma.EventUpsertWithoutTranslationsInput> = z.object({
  update: z.union([ z.lazy(() => EventUpdateWithoutTranslationsInputSchema), z.lazy(() => EventUncheckedUpdateWithoutTranslationsInputSchema) ]),
  create: z.union([ z.lazy(() => EventCreateWithoutTranslationsInputSchema), z.lazy(() => EventUncheckedCreateWithoutTranslationsInputSchema) ]),
  where: z.lazy(() => EventWhereInputSchema).optional(),
}).strict();

export default EventUpsertWithoutTranslationsInputSchema;
