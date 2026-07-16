import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryTranslationWhereUniqueInputSchema } from './CategoryTranslationWhereUniqueInputSchema';
import { CategoryTranslationUpdateWithoutCategoryInputSchema } from './CategoryTranslationUpdateWithoutCategoryInputSchema';
import { CategoryTranslationUncheckedUpdateWithoutCategoryInputSchema } from './CategoryTranslationUncheckedUpdateWithoutCategoryInputSchema';

export const CategoryTranslationUpdateWithWhereUniqueWithoutCategoryInputSchema: z.ZodType<Prisma.CategoryTranslationUpdateWithWhereUniqueWithoutCategoryInput> = z.strictObject({
  where: z.lazy(() => CategoryTranslationWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CategoryTranslationUpdateWithoutCategoryInputSchema), z.lazy(() => CategoryTranslationUncheckedUpdateWithoutCategoryInputSchema) ]),
});

export default CategoryTranslationUpdateWithWhereUniqueWithoutCategoryInputSchema;
