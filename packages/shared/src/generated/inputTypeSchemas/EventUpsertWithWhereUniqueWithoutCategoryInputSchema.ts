import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventUpdateWithoutCategoryInputSchema } from './EventUpdateWithoutCategoryInputSchema';
import { EventUncheckedUpdateWithoutCategoryInputSchema } from './EventUncheckedUpdateWithoutCategoryInputSchema';
import { EventCreateWithoutCategoryInputSchema } from './EventCreateWithoutCategoryInputSchema';
import { EventUncheckedCreateWithoutCategoryInputSchema } from './EventUncheckedCreateWithoutCategoryInputSchema';

export const EventUpsertWithWhereUniqueWithoutCategoryInputSchema: z.ZodType<Prisma.EventUpsertWithWhereUniqueWithoutCategoryInput> = z.object({
  where: z.lazy(() => EventWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => EventUpdateWithoutCategoryInputSchema), z.lazy(() => EventUncheckedUpdateWithoutCategoryInputSchema) ]),
  create: z.union([ z.lazy(() => EventCreateWithoutCategoryInputSchema), z.lazy(() => EventUncheckedCreateWithoutCategoryInputSchema) ]),
}).strict();

export default EventUpsertWithWhereUniqueWithoutCategoryInputSchema;
