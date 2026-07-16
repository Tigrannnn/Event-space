import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryTranslationUncheckedCreateNestedManyWithoutCategoryInputSchema } from './CategoryTranslationUncheckedCreateNestedManyWithoutCategoryInputSchema';

export const CategoryUncheckedCreateWithoutEventsInputSchema: z.ZodType<Prisma.CategoryUncheckedCreateWithoutEventsInput> = z.strictObject({
  id: z.uuid().optional(),
  slug: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  translations: z.lazy(() => CategoryTranslationUncheckedCreateNestedManyWithoutCategoryInputSchema).optional(),
});

export default CategoryUncheckedCreateWithoutEventsInputSchema;
