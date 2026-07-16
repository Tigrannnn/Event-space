import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventCreateWithoutTranslationsInputSchema } from './EventCreateWithoutTranslationsInputSchema';
import { EventUncheckedCreateWithoutTranslationsInputSchema } from './EventUncheckedCreateWithoutTranslationsInputSchema';

export const EventCreateOrConnectWithoutTranslationsInputSchema: z.ZodType<Prisma.EventCreateOrConnectWithoutTranslationsInput> = z.strictObject({
  where: z.lazy(() => EventWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EventCreateWithoutTranslationsInputSchema), z.lazy(() => EventUncheckedCreateWithoutTranslationsInputSchema) ]),
});

export default EventCreateOrConnectWithoutTranslationsInputSchema;
