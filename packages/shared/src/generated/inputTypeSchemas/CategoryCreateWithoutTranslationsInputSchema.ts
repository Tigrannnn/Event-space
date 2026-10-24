import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateNestedManyWithoutCategoryInputSchema } from './EventCreateNestedManyWithoutCategoryInputSchema';
import { BannerCreateNestedManyWithoutCategoryInputSchema } from './BannerCreateNestedManyWithoutCategoryInputSchema';

export const CategoryCreateWithoutTranslationsInputSchema: z.ZodType<Prisma.CategoryCreateWithoutTranslationsInput> = z.strictObject({
  id: z.uuid().optional(),
  slug: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  events: z.lazy(() => EventCreateNestedManyWithoutCategoryInputSchema).optional(),
  banners: z.lazy(() => BannerCreateNestedManyWithoutCategoryInputSchema).optional(),
});

export default CategoryCreateWithoutTranslationsInputSchema;
