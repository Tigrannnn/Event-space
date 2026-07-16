import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';

export const CategoryTranslationCreateWithoutCategoryInputSchema: z.ZodType<Prisma.CategoryTranslationCreateWithoutCategoryInput> = z.strictObject({
  id: z.uuid().optional(),
  locale: z.lazy(() => LocaleSchema),
  name: z.string(),
});

export default CategoryTranslationCreateWithoutCategoryInputSchema;
