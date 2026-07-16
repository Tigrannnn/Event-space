import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventUpdateWithoutCategoryInputSchema } from './EventUpdateWithoutCategoryInputSchema';
import { EventUncheckedUpdateWithoutCategoryInputSchema } from './EventUncheckedUpdateWithoutCategoryInputSchema';

export const EventUpdateWithWhereUniqueWithoutCategoryInputSchema: z.ZodType<Prisma.EventUpdateWithWhereUniqueWithoutCategoryInput> = z.strictObject({
  where: z.lazy(() => EventWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => EventUpdateWithoutCategoryInputSchema), z.lazy(() => EventUncheckedUpdateWithoutCategoryInputSchema) ]),
});

export default EventUpdateWithWhereUniqueWithoutCategoryInputSchema;
