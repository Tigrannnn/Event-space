import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventUpdateWithoutCancellationRulesInputSchema } from './EventUpdateWithoutCancellationRulesInputSchema';
import { EventUncheckedUpdateWithoutCancellationRulesInputSchema } from './EventUncheckedUpdateWithoutCancellationRulesInputSchema';
import { EventCreateWithoutCancellationRulesInputSchema } from './EventCreateWithoutCancellationRulesInputSchema';
import { EventUncheckedCreateWithoutCancellationRulesInputSchema } from './EventUncheckedCreateWithoutCancellationRulesInputSchema';
import { EventWhereInputSchema } from './EventWhereInputSchema';

export const EventUpsertWithoutCancellationRulesInputSchema: z.ZodType<Prisma.EventUpsertWithoutCancellationRulesInput> = z.object({
  update: z.union([ z.lazy(() => EventUpdateWithoutCancellationRulesInputSchema), z.lazy(() => EventUncheckedUpdateWithoutCancellationRulesInputSchema) ]),
  create: z.union([ z.lazy(() => EventCreateWithoutCancellationRulesInputSchema), z.lazy(() => EventUncheckedCreateWithoutCancellationRulesInputSchema) ]),
  where: z.lazy(() => EventWhereInputSchema).optional(),
}).strict();

export default EventUpsertWithoutCancellationRulesInputSchema;
