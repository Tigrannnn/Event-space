import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';

export const CategoryTranslationCategoryIdLocaleCompoundUniqueInputSchema: z.ZodType<Prisma.CategoryTranslationCategoryIdLocaleCompoundUniqueInput> = z.strictObject({
  categoryId: z.string(),
  locale: z.lazy(() => LocaleSchema),
});

export default CategoryTranslationCategoryIdLocaleCompoundUniqueInputSchema;
