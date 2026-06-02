import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateWithoutCancellationRulesInputSchema } from './EventCreateWithoutCancellationRulesInputSchema';
import { EventUncheckedCreateWithoutCancellationRulesInputSchema } from './EventUncheckedCreateWithoutCancellationRulesInputSchema';
import { EventCreateOrConnectWithoutCancellationRulesInputSchema } from './EventCreateOrConnectWithoutCancellationRulesInputSchema';
import { EventUpsertWithoutCancellationRulesInputSchema } from './EventUpsertWithoutCancellationRulesInputSchema';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventUpdateToOneWithWhereWithoutCancellationRulesInputSchema } from './EventUpdateToOneWithWhereWithoutCancellationRulesInputSchema';
import { EventUpdateWithoutCancellationRulesInputSchema } from './EventUpdateWithoutCancellationRulesInputSchema';
import { EventUncheckedUpdateWithoutCancellationRulesInputSchema } from './EventUncheckedUpdateWithoutCancellationRulesInputSchema';

export const EventUpdateOneRequiredWithoutCancellationRulesNestedInputSchema: z.ZodType<Prisma.EventUpdateOneRequiredWithoutCancellationRulesNestedInput> = z.object({
  create: z.union([ z.lazy(() => EventCreateWithoutCancellationRulesInputSchema), z.lazy(() => EventUncheckedCreateWithoutCancellationRulesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => EventCreateOrConnectWithoutCancellationRulesInputSchema).optional(),
  upsert: z.lazy(() => EventUpsertWithoutCancellationRulesInputSchema).optional(),
  connect: z.lazy(() => EventWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => EventUpdateToOneWithWhereWithoutCancellationRulesInputSchema), z.lazy(() => EventUpdateWithoutCancellationRulesInputSchema), z.lazy(() => EventUncheckedUpdateWithoutCancellationRulesInputSchema) ]).optional(),
}).strict();

export default EventUpdateOneRequiredWithoutCancellationRulesNestedInputSchema;
