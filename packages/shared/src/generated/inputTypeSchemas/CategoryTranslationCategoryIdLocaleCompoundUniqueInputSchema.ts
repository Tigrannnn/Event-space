import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';

export const CategoryTranslationCategoryIdLocaleCompoundUniqueInputSchema: z.ZodType<Prisma.CategoryTranslationCategoryIdLocaleCompoundUniqueInput> = z.object({
  categoryId: z.string(),
  locale: z.lazy(() => LocaleSchema),
}).strict();

export default CategoryTranslationCategoryIdLocaleCompoundUniqueInputSchema;
