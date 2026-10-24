import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryUpdateWithoutBannersInputSchema } from './CategoryUpdateWithoutBannersInputSchema';
import { CategoryUncheckedUpdateWithoutBannersInputSchema } from './CategoryUncheckedUpdateWithoutBannersInputSchema';
import { CategoryCreateWithoutBannersInputSchema } from './CategoryCreateWithoutBannersInputSchema';
import { CategoryUncheckedCreateWithoutBannersInputSchema } from './CategoryUncheckedCreateWithoutBannersInputSchema';
import { CategoryWhereInputSchema } from './CategoryWhereInputSchema';

export const CategoryUpsertWithoutBannersInputSchema: z.ZodType<Prisma.CategoryUpsertWithoutBannersInput> = z.strictObject({
  update: z.union([ z.lazy(() => CategoryUpdateWithoutBannersInputSchema), z.lazy(() => CategoryUncheckedUpdateWithoutBannersInputSchema) ]),
  create: z.union([ z.lazy(() => CategoryCreateWithoutBannersInputSchema), z.lazy(() => CategoryUncheckedCreateWithoutBannersInputSchema) ]),
  where: z.lazy(() => CategoryWhereInputSchema).optional(),
});

export default CategoryUpsertWithoutBannersInputSchema;
