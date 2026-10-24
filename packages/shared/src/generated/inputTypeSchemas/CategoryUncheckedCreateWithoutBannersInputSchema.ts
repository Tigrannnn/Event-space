import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryTranslationUncheckedCreateNestedManyWithoutCategoryInputSchema } from './CategoryTranslationUncheckedCreateNestedManyWithoutCategoryInputSchema';
import { EventUncheckedCreateNestedManyWithoutCategoryInputSchema } from './EventUncheckedCreateNestedManyWithoutCategoryInputSchema';

export const CategoryUncheckedCreateWithoutBannersInputSchema: z.ZodType<Prisma.CategoryUncheckedCreateWithoutBannersInput> = z.strictObject({
  id: z.uuid().optional(),
  slug: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  translations: z.lazy(() => CategoryTranslationUncheckedCreateNestedManyWithoutCategoryInputSchema).optional(),
  events: z.lazy(() => EventUncheckedCreateNestedManyWithoutCategoryInputSchema).optional(),
});

export default CategoryUncheckedCreateWithoutBannersInputSchema;
