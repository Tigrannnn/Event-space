import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventCreateWithoutCancellationRulesInputSchema } from './EventCreateWithoutCancellationRulesInputSchema';
import { EventUncheckedCreateWithoutCancellationRulesInputSchema } from './EventUncheckedCreateWithoutCancellationRulesInputSchema';

export const EventCreateOrConnectWithoutCancellationRulesInputSchema: z.ZodType<Prisma.EventCreateOrConnectWithoutCancellationRulesInput> = z.strictObject({
  where: z.lazy(() => EventWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EventCreateWithoutCancellationRulesInputSchema), z.lazy(() => EventUncheckedCreateWithoutCancellationRulesInputSchema) ]),
});

export default EventCreateOrConnectWithoutCancellationRulesInputSchema;
