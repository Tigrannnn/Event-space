import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';

export const CategoryTranslationUncheckedCreateInputSchema: z.ZodType<Prisma.CategoryTranslationUncheckedCreateInput> = z.object({
  id: z.uuid().optional(),
  categoryId: z.string(),
  locale: z.lazy(() => LocaleSchema),
  name: z.string(),
}).strict();

export default CategoryTranslationUncheckedCreateInputSchema;
