import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';
import { CategoryCreateNestedOneWithoutTranslationsInputSchema } from './CategoryCreateNestedOneWithoutTranslationsInputSchema';

export const CategoryTranslationCreateInputSchema: z.ZodType<Prisma.CategoryTranslationCreateInput> = z.object({
  id: z.uuid().optional(),
  locale: z.lazy(() => LocaleSchema),
  name: z.string(),
  category: z.lazy(() => CategoryCreateNestedOneWithoutTranslationsInputSchema),
}).strict();

export default CategoryTranslationCreateInputSchema;
