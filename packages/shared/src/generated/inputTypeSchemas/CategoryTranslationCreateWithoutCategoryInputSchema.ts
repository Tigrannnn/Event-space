import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';

export const CategoryTranslationCreateWithoutCategoryInputSchema: z.ZodType<Prisma.CategoryTranslationCreateWithoutCategoryInput> = z.object({
  id: z.uuid().optional(),
  locale: z.lazy(() => LocaleSchema),
  name: z.string(),
}).strict();

export default CategoryTranslationCreateWithoutCategoryInputSchema;
