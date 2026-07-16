import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateWithoutTranslationsInputSchema } from './EventCreateWithoutTranslationsInputSchema';
import { EventUncheckedCreateWithoutTranslationsInputSchema } from './EventUncheckedCreateWithoutTranslationsInputSchema';
import { EventCreateOrConnectWithoutTranslationsInputSchema } from './EventCreateOrConnectWithoutTranslationsInputSchema';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';

export const EventCreateNestedOneWithoutTranslationsInputSchema: z.ZodType<Prisma.EventCreateNestedOneWithoutTranslationsInput> = z.strictObject({
  create: z.union([ z.lazy(() => EventCreateWithoutTranslationsInputSchema), z.lazy(() => EventUncheckedCreateWithoutTranslationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => EventCreateOrConnectWithoutTranslationsInputSchema).optional(),
  connect: z.lazy(() => EventWhereUniqueInputSchema).optional(),
});

export default EventCreateNestedOneWithoutTranslationsInputSchema;
