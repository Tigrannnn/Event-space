import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryWhereInputSchema } from './CategoryWhereInputSchema';
import { CategoryUpdateWithoutBannersInputSchema } from './CategoryUpdateWithoutBannersInputSchema';
import { CategoryUncheckedUpdateWithoutBannersInputSchema } from './CategoryUncheckedUpdateWithoutBannersInputSchema';

export const CategoryUpdateToOneWithWhereWithoutBannersInputSchema: z.ZodType<Prisma.CategoryUpdateToOneWithWhereWithoutBannersInput> = z.strictObject({
  where: z.lazy(() => CategoryWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => CategoryUpdateWithoutBannersInputSchema), z.lazy(() => CategoryUncheckedUpdateWithoutBannersInputSchema) ]),
});

export default CategoryUpdateToOneWithWhereWithoutBannersInputSchema;
