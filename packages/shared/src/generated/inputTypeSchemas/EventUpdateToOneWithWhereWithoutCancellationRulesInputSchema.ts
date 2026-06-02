import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereInputSchema } from './EventWhereInputSchema';
import { EventUpdateWithoutCancellationRulesInputSchema } from './EventUpdateWithoutCancellationRulesInputSchema';
import { EventUncheckedUpdateWithoutCancellationRulesInputSchema } from './EventUncheckedUpdateWithoutCancellationRulesInputSchema';

export const EventUpdateToOneWithWhereWithoutCancellationRulesInputSchema: z.ZodType<Prisma.EventUpdateToOneWithWhereWithoutCancellationRulesInput> = z.object({
  where: z.lazy(() => EventWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => EventUpdateWithoutCancellationRulesInputSchema), z.lazy(() => EventUncheckedUpdateWithoutCancellationRulesInputSchema) ]),
}).strict();

export default EventUpdateToOneWithWhereWithoutCancellationRulesInputSchema;
