import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryTranslationScalarWhereInputSchema } from './CategoryTranslationScalarWhereInputSchema';
import { CategoryTranslationUpdateManyMutationInputSchema } from './CategoryTranslationUpdateManyMutationInputSchema';
import { CategoryTranslationUncheckedUpdateManyWithoutCategoryInputSchema } from './CategoryTranslationUncheckedUpdateManyWithoutCategoryInputSchema';

export const CategoryTranslationUpdateManyWithWhereWithoutCategoryInputSchema: z.ZodType<Prisma.CategoryTranslationUpdateManyWithWhereWithoutCategoryInput> = z.object({
  where: z.lazy(() => CategoryTranslationScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CategoryTranslationUpdateManyMutationInputSchema), z.lazy(() => CategoryTranslationUncheckedUpdateManyWithoutCategoryInputSchema) ]),
}).strict();

export default CategoryTranslationUpdateManyWithWhereWithoutCategoryInputSchema;
