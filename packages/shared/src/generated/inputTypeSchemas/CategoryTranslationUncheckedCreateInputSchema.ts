import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';

export const CategoryTranslationUncheckedCreateInputSchema: z.ZodType<Prisma.CategoryTranslationUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  categoryId: z.string(),
  locale: z.lazy(() => LocaleSchema),
  name: z.string(),
});

export default CategoryTranslationUncheckedCreateInputSchema;
