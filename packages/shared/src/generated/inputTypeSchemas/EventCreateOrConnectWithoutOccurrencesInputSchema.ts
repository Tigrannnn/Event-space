import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventCreateWithoutOccurrencesInputSchema } from './EventCreateWithoutOccurrencesInputSchema';
import { EventUncheckedCreateWithoutOccurrencesInputSchema } from './EventUncheckedCreateWithoutOccurrencesInputSchema';

export const EventCreateOrConnectWithoutOccurrencesInputSchema: z.ZodType<Prisma.EventCreateOrConnectWithoutOccurrencesInput> = z.strictObject({
  where: z.lazy(() => EventWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EventCreateWithoutOccurrencesInputSchema), z.lazy(() => EventUncheckedCreateWithoutOccurrencesInputSchema) ]),
});

export default EventCreateOrConnectWithoutOccurrencesInputSchema;
