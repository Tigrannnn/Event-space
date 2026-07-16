import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';

export const CategoryTranslationCreateManyCategoryInputSchema: z.ZodType<Prisma.CategoryTranslationCreateManyCategoryInput> = z.strictObject({
  id: z.uuid().optional(),
  locale: z.lazy(() => LocaleSchema),
  name: z.string(),
});

export default CategoryTranslationCreateManyCategoryInputSchema;
