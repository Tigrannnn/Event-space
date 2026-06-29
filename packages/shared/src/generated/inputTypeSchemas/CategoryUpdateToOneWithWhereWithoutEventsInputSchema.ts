import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryWhereInputSchema } from './CategoryWhereInputSchema';
import { CategoryUpdateWithoutEventsInputSchema } from './CategoryUpdateWithoutEventsInputSchema';
import { CategoryUncheckedUpdateWithoutEventsInputSchema } from './CategoryUncheckedUpdateWithoutEventsInputSchema';

export const CategoryUpdateToOneWithWhereWithoutEventsInputSchema: z.ZodType<Prisma.CategoryUpdateToOneWithWhereWithoutEventsInput> = z.object({
  where: z.lazy(() => CategoryWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => CategoryUpdateWithoutEventsInputSchema), z.lazy(() => CategoryUncheckedUpdateWithoutEventsInputSchema) ]),
}).strict();

export default CategoryUpdateToOneWithWhereWithoutEventsInputSchema;
