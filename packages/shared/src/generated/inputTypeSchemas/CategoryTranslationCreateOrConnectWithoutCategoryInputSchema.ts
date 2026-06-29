import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryTranslationWhereUniqueInputSchema } from './CategoryTranslationWhereUniqueInputSchema';
import { CategoryTranslationCreateWithoutCategoryInputSchema } from './CategoryTranslationCreateWithoutCategoryInputSchema';
import { CategoryTranslationUncheckedCreateWithoutCategoryInputSchema } from './CategoryTranslationUncheckedCreateWithoutCategoryInputSchema';

export const CategoryTranslationCreateOrConnectWithoutCategoryInputSchema: z.ZodType<Prisma.CategoryTranslationCreateOrConnectWithoutCategoryInput> = z.object({
  where: z.lazy(() => CategoryTranslationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CategoryTranslationCreateWithoutCategoryInputSchema), z.lazy(() => CategoryTranslationUncheckedCreateWithoutCategoryInputSchema) ]),
}).strict();

export default CategoryTranslationCreateOrConnectWithoutCategoryInputSchema;
