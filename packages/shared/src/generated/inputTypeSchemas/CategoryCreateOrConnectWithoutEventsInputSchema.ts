import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryWhereUniqueInputSchema } from './CategoryWhereUniqueInputSchema';
import { CategoryCreateWithoutEventsInputSchema } from './CategoryCreateWithoutEventsInputSchema';
import { CategoryUncheckedCreateWithoutEventsInputSchema } from './CategoryUncheckedCreateWithoutEventsInputSchema';

export const CategoryCreateOrConnectWithoutEventsInputSchema: z.ZodType<Prisma.CategoryCreateOrConnectWithoutEventsInput> = z.object({
  where: z.lazy(() => CategoryWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CategoryCreateWithoutEventsInputSchema), z.lazy(() => CategoryUncheckedCreateWithoutEventsInputSchema) ]),
}).strict();

export default CategoryCreateOrConnectWithoutEventsInputSchema;
