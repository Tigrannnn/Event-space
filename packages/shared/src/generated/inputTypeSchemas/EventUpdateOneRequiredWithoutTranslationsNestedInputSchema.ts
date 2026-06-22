import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateWithoutTranslationsInputSchema } from './EventCreateWithoutTranslationsInputSchema';
import { EventUncheckedCreateWithoutTranslationsInputSchema } from './EventUncheckedCreateWithoutTranslationsInputSchema';
import { EventCreateOrConnectWithoutTranslationsInputSchema } from './EventCreateOrConnectWithoutTranslationsInputSchema';
import { EventUpsertWithoutTranslationsInputSchema } from './EventUpsertWithoutTranslationsInputSchema';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventUpdateToOneWithWhereWithoutTranslationsInputSchema } from './EventUpdateToOneWithWhereWithoutTranslationsInputSchema';
import { EventUpdateWithoutTranslationsInputSchema } from './EventUpdateWithoutTranslationsInputSchema';
import { EventUncheckedUpdateWithoutTranslationsInputSchema } from './EventUncheckedUpdateWithoutTranslationsInputSchema';

export const EventUpdateOneRequiredWithoutTranslationsNestedInputSchema: z.ZodType<Prisma.EventUpdateOneRequiredWithoutTranslationsNestedInput> = z.object({
  create: z.union([ z.lazy(() => EventCreateWithoutTranslationsInputSchema), z.lazy(() => EventUncheckedCreateWithoutTranslationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => EventCreateOrConnectWithoutTranslationsInputSchema).optional(),
  upsert: z.lazy(() => EventUpsertWithoutTranslationsInputSchema).optional(),
  connect: z.lazy(() => EventWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => EventUpdateToOneWithWhereWithoutTranslationsInputSchema), z.lazy(() => EventUpdateWithoutTranslationsInputSchema), z.lazy(() => EventUncheckedUpdateWithoutTranslationsInputSchema) ]).optional(),
}).strict();

export default EventUpdateOneRequiredWithoutTranslationsNestedInputSchema;
