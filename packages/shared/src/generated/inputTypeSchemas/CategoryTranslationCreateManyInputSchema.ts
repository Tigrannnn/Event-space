import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';

export const CategoryTranslationCreateManyInputSchema: z.ZodType<Prisma.CategoryTranslationCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  categoryId: z.string(),
  locale: z.lazy(() => LocaleSchema),
  name: z.string(),
});

export default CategoryTranslationCreateManyInputSchema;
