import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateWithoutOccurrencesInputSchema } from './EventCreateWithoutOccurrencesInputSchema';
import { EventUncheckedCreateWithoutOccurrencesInputSchema } from './EventUncheckedCreateWithoutOccurrencesInputSchema';
import { EventCreateOrConnectWithoutOccurrencesInputSchema } from './EventCreateOrConnectWithoutOccurrencesInputSchema';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';

export const EventCreateNestedOneWithoutOccurrencesInputSchema: z.ZodType<Prisma.EventCreateNestedOneWithoutOccurrencesInput> = z.strictObject({
  create: z.union([ z.lazy(() => EventCreateWithoutOccurrencesInputSchema), z.lazy(() => EventUncheckedCreateWithoutOccurrencesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => EventCreateOrConnectWithoutOccurrencesInputSchema).optional(),
  connect: z.lazy(() => EventWhereUniqueInputSchema).optional(),
});

export default EventCreateNestedOneWithoutOccurrencesInputSchema;
