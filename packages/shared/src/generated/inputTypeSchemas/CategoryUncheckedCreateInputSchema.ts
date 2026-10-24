import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryTranslationUncheckedCreateNestedManyWithoutCategoryInputSchema } from './CategoryTranslationUncheckedCreateNestedManyWithoutCategoryInputSchema';
import { EventUncheckedCreateNestedManyWithoutCategoryInputSchema } from './EventUncheckedCreateNestedManyWithoutCategoryInputSchema';
import { BannerUncheckedCreateNestedManyWithoutCategoryInputSchema } from './BannerUncheckedCreateNestedManyWithoutCategoryInputSchema';

export const CategoryUncheckedCreateInputSchema: z.ZodType<Prisma.CategoryUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  slug: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  translations: z.lazy(() => CategoryTranslationUncheckedCreateNestedManyWithoutCategoryInputSchema).optional(),
  events: z.lazy(() => EventUncheckedCreateNestedManyWithoutCategoryInputSchema).optional(),
  banners: z.lazy(() => BannerUncheckedCreateNestedManyWithoutCategoryInputSchema).optional(),
});

export default CategoryUncheckedCreateInputSchema;
