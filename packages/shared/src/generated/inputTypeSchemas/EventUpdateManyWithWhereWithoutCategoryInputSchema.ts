import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventScalarWhereInputSchema } from './EventScalarWhereInputSchema';
import { EventUpdateManyMutationInputSchema } from './EventUpdateManyMutationInputSchema';
import { EventUncheckedUpdateManyWithoutCategoryInputSchema } from './EventUncheckedUpdateManyWithoutCategoryInputSchema';

export const EventUpdateManyWithWhereWithoutCategoryInputSchema: z.ZodType<Prisma.EventUpdateManyWithWhereWithoutCategoryInput> = z.object({
  where: z.lazy(() => EventScalarWhereInputSchema),
  data: z.union([ z.lazy(() => EventUpdateManyMutationInputSchema), z.lazy(() => EventUncheckedUpdateManyWithoutCategoryInputSchema) ]),
}).strict();

export default EventUpdateManyWithWhereWithoutCategoryInputSchema;
