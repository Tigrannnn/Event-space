import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';

export const CategoryTranslationCreateManyCategoryInputSchema: z.ZodType<Prisma.CategoryTranslationCreateManyCategoryInput> = z.object({
  id: z.uuid().optional(),
  locale: z.lazy(() => LocaleSchema),
  name: z.string(),
}).strict();

export default CategoryTranslationCreateManyCategoryInputSchema;
