import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryUpdateWithoutEventsInputSchema } from './CategoryUpdateWithoutEventsInputSchema';
import { CategoryUncheckedUpdateWithoutEventsInputSchema } from './CategoryUncheckedUpdateWithoutEventsInputSchema';
import { CategoryCreateWithoutEventsInputSchema } from './CategoryCreateWithoutEventsInputSchema';
import { CategoryUncheckedCreateWithoutEventsInputSchema } from './CategoryUncheckedCreateWithoutEventsInputSchema';
import { CategoryWhereInputSchema } from './CategoryWhereInputSchema';

export const CategoryUpsertWithoutEventsInputSchema: z.ZodType<Prisma.CategoryUpsertWithoutEventsInput> = z.strictObject({
  update: z.union([ z.lazy(() => CategoryUpdateWithoutEventsInputSchema), z.lazy(() => CategoryUncheckedUpdateWithoutEventsInputSchema) ]),
  create: z.union([ z.lazy(() => CategoryCreateWithoutEventsInputSchema), z.lazy(() => CategoryUncheckedCreateWithoutEventsInputSchema) ]),
  where: z.lazy(() => CategoryWhereInputSchema).optional(),
});

export default CategoryUpsertWithoutEventsInputSchema;
