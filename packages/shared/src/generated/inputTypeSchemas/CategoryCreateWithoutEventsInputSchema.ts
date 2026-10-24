import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryTranslationCreateNestedManyWithoutCategoryInputSchema } from './CategoryTranslationCreateNestedManyWithoutCategoryInputSchema';
import { BannerCreateNestedManyWithoutCategoryInputSchema } from './BannerCreateNestedManyWithoutCategoryInputSchema';

export const CategoryCreateWithoutEventsInputSchema: z.ZodType<Prisma.CategoryCreateWithoutEventsInput> = z.strictObject({
  id: z.uuid().optional(),
  slug: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  translations: z.lazy(() => CategoryTranslationCreateNestedManyWithoutCategoryInputSchema).optional(),
  banners: z.lazy(() => BannerCreateNestedManyWithoutCategoryInputSchema).optional(),
});

export default CategoryCreateWithoutEventsInputSchema;
