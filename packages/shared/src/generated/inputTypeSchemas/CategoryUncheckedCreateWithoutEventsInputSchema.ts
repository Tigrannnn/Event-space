import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryTranslationUncheckedCreateNestedManyWithoutCategoryInputSchema } from './CategoryTranslationUncheckedCreateNestedManyWithoutCategoryInputSchema';
import { BannerUncheckedCreateNestedManyWithoutCategoryInputSchema } from './BannerUncheckedCreateNestedManyWithoutCategoryInputSchema';

export const CategoryUncheckedCreateWithoutEventsInputSchema: z.ZodType<Prisma.CategoryUncheckedCreateWithoutEventsInput> = z.strictObject({
  id: z.uuid().optional(),
  slug: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  translations: z.lazy(() => CategoryTranslationUncheckedCreateNestedManyWithoutCategoryInputSchema).optional(),
  banners: z.lazy(() => BannerUncheckedCreateNestedManyWithoutCategoryInputSchema).optional(),
});

export default CategoryUncheckedCreateWithoutEventsInputSchema;
