import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventCreateWithoutCategoryInputSchema } from './EventCreateWithoutCategoryInputSchema';
import { EventUncheckedCreateWithoutCategoryInputSchema } from './EventUncheckedCreateWithoutCategoryInputSchema';

export const EventCreateOrConnectWithoutCategoryInputSchema: z.ZodType<Prisma.EventCreateOrConnectWithoutCategoryInput> = z.strictObject({
  where: z.lazy(() => EventWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EventCreateWithoutCategoryInputSchema), z.lazy(() => EventUncheckedCreateWithoutCategoryInputSchema) ]),
});

export default EventCreateOrConnectWithoutCategoryInputSchema;
