import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateWithoutCancellationRulesInputSchema } from './EventCreateWithoutCancellationRulesInputSchema';
import { EventUncheckedCreateWithoutCancellationRulesInputSchema } from './EventUncheckedCreateWithoutCancellationRulesInputSchema';
import { EventCreateOrConnectWithoutCancellationRulesInputSchema } from './EventCreateOrConnectWithoutCancellationRulesInputSchema';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';

export const EventCreateNestedOneWithoutCancellationRulesInputSchema: z.ZodType<Prisma.EventCreateNestedOneWithoutCancellationRulesInput> = z.strictObject({
  create: z.union([ z.lazy(() => EventCreateWithoutCancellationRulesInputSchema), z.lazy(() => EventUncheckedCreateWithoutCancellationRulesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => EventCreateOrConnectWithoutCancellationRulesInputSchema).optional(),
  connect: z.lazy(() => EventWhereUniqueInputSchema).optional(),
});

export default EventCreateNestedOneWithoutCancellationRulesInputSchema;
