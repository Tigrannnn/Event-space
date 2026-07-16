import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryWhereInputSchema } from './CategoryWhereInputSchema';
import { CategoryUpdateWithoutEventsInputSchema } from './CategoryUpdateWithoutEventsInputSchema';
import { CategoryUncheckedUpdateWithoutEventsInputSchema } from './CategoryUncheckedUpdateWithoutEventsInputSchema';

export const CategoryUpdateToOneWithWhereWithoutEventsInputSchema: z.ZodType<Prisma.CategoryUpdateToOneWithWhereWithoutEventsInput> = z.strictObject({
  where: z.lazy(() => CategoryWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => CategoryUpdateWithoutEventsInputSchema), z.lazy(() => CategoryUncheckedUpdateWithoutEventsInputSchema) ]),
});

export default CategoryUpdateToOneWithWhereWithoutEventsInputSchema;
