import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateWithoutOccurrencesInputSchema } from './EventCreateWithoutOccurrencesInputSchema';
import { EventUncheckedCreateWithoutOccurrencesInputSchema } from './EventUncheckedCreateWithoutOccurrencesInputSchema';
import { EventCreateOrConnectWithoutOccurrencesInputSchema } from './EventCreateOrConnectWithoutOccurrencesInputSchema';
import { EventUpsertWithoutOccurrencesInputSchema } from './EventUpsertWithoutOccurrencesInputSchema';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventUpdateToOneWithWhereWithoutOccurrencesInputSchema } from './EventUpdateToOneWithWhereWithoutOccurrencesInputSchema';
import { EventUpdateWithoutOccurrencesInputSchema } from './EventUpdateWithoutOccurrencesInputSchema';
import { EventUncheckedUpdateWithoutOccurrencesInputSchema } from './EventUncheckedUpdateWithoutOccurrencesInputSchema';

export const EventUpdateOneRequiredWithoutOccurrencesNestedInputSchema: z.ZodType<Prisma.EventUpdateOneRequiredWithoutOccurrencesNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => EventCreateWithoutOccurrencesInputSchema), z.lazy(() => EventUncheckedCreateWithoutOccurrencesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => EventCreateOrConnectWithoutOccurrencesInputSchema).optional(),
  upsert: z.lazy(() => EventUpsertWithoutOccurrencesInputSchema).optional(),
  connect: z.lazy(() => EventWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => EventUpdateToOneWithWhereWithoutOccurrencesInputSchema), z.lazy(() => EventUpdateWithoutOccurrencesInputSchema), z.lazy(() => EventUncheckedUpdateWithoutOccurrencesInputSchema) ]).optional(),
});

export default EventUpdateOneRequiredWithoutOccurrencesNestedInputSchema;
