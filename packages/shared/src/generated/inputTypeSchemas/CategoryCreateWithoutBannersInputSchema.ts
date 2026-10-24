import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryTranslationCreateNestedManyWithoutCategoryInputSchema } from './CategoryTranslationCreateNestedManyWithoutCategoryInputSchema';
import { EventCreateNestedManyWithoutCategoryInputSchema } from './EventCreateNestedManyWithoutCategoryInputSchema';

export const CategoryCreateWithoutBannersInputSchema: z.ZodType<Prisma.CategoryCreateWithoutBannersInput> = z.strictObject({
  id: z.uuid().optional(),
  slug: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  translations: z.lazy(() => CategoryTranslationCreateNestedManyWithoutCategoryInputSchema).optional(),
  events: z.lazy(() => EventCreateNestedManyWithoutCategoryInputSchema).optional(),
});

export default CategoryCreateWithoutBannersInputSchema;
