import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryTranslationWhereUniqueInputSchema } from './CategoryTranslationWhereUniqueInputSchema';
import { CategoryTranslationUpdateWithoutCategoryInputSchema } from './CategoryTranslationUpdateWithoutCategoryInputSchema';
import { CategoryTranslationUncheckedUpdateWithoutCategoryInputSchema } from './CategoryTranslationUncheckedUpdateWithoutCategoryInputSchema';
import { CategoryTranslationCreateWithoutCategoryInputSchema } from './CategoryTranslationCreateWithoutCategoryInputSchema';
import { CategoryTranslationUncheckedCreateWithoutCategoryInputSchema } from './CategoryTranslationUncheckedCreateWithoutCategoryInputSchema';

export const CategoryTranslationUpsertWithWhereUniqueWithoutCategoryInputSchema: z.ZodType<Prisma.CategoryTranslationUpsertWithWhereUniqueWithoutCategoryInput> = z.object({
  where: z.lazy(() => CategoryTranslationWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CategoryTranslationUpdateWithoutCategoryInputSchema), z.lazy(() => CategoryTranslationUncheckedUpdateWithoutCategoryInputSchema) ]),
  create: z.union([ z.lazy(() => CategoryTranslationCreateWithoutCategoryInputSchema), z.lazy(() => CategoryTranslationUncheckedCreateWithoutCategoryInputSchema) ]),
}).strict();

export default CategoryTranslationUpsertWithWhereUniqueWithoutCategoryInputSchema;
