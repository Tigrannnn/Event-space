import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventUncheckedCreateNestedManyWithoutCategoryInputSchema } from './EventUncheckedCreateNestedManyWithoutCategoryInputSchema';
import { BannerUncheckedCreateNestedManyWithoutCategoryInputSchema } from './BannerUncheckedCreateNestedManyWithoutCategoryInputSchema';

export const CategoryUncheckedCreateWithoutTranslationsInputSchema: z.ZodType<Prisma.CategoryUncheckedCreateWithoutTranslationsInput> = z.strictObject({
  id: z.uuid().optional(),
  slug: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  events: z.lazy(() => EventUncheckedCreateNestedManyWithoutCategoryInputSchema).optional(),
  banners: z.lazy(() => BannerUncheckedCreateNestedManyWithoutCategoryInputSchema).optional(),
});

export default CategoryUncheckedCreateWithoutTranslationsInputSchema;
