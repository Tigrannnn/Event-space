import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { EnumLocaleWithAggregatesFilterSchema } from './EnumLocaleWithAggregatesFilterSchema';
import { LocaleSchema } from './LocaleSchema';

export const CategoryTranslationScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CategoryTranslationScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CategoryTranslationScalarWhereWithAggregatesInputSchema), z.lazy(() => CategoryTranslationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => CategoryTranslationScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CategoryTranslationScalarWhereWithAggregatesInputSchema), z.lazy(() => CategoryTranslationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  categoryId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  locale: z.union([ z.lazy(() => EnumLocaleWithAggregatesFilterSchema), z.lazy(() => LocaleSchema) ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
});

export default CategoryTranslationScalarWhereWithAggregatesInputSchema;
