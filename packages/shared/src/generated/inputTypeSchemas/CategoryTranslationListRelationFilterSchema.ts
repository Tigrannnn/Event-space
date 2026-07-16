import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryTranslationWhereInputSchema } from './CategoryTranslationWhereInputSchema';

export const CategoryTranslationListRelationFilterSchema: z.ZodType<Prisma.CategoryTranslationListRelationFilter> = z.strictObject({
  every: z.lazy(() => CategoryTranslationWhereInputSchema).optional(),
  some: z.lazy(() => CategoryTranslationWhereInputSchema).optional(),
  none: z.lazy(() => CategoryTranslationWhereInputSchema).optional(),
});

export default CategoryTranslationListRelationFilterSchema;
