import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumLocaleFilterSchema } from './EnumLocaleFilterSchema';
import { LocaleSchema } from './LocaleSchema';
import { CategoryScalarRelationFilterSchema } from './CategoryScalarRelationFilterSchema';
import { CategoryWhereInputSchema } from './CategoryWhereInputSchema';

export const CategoryTranslationWhereInputSchema: z.ZodType<Prisma.CategoryTranslationWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CategoryTranslationWhereInputSchema), z.lazy(() => CategoryTranslationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CategoryTranslationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CategoryTranslationWhereInputSchema), z.lazy(() => CategoryTranslationWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  categoryId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  locale: z.union([ z.lazy(() => EnumLocaleFilterSchema), z.lazy(() => LocaleSchema) ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  category: z.union([ z.lazy(() => CategoryScalarRelationFilterSchema), z.lazy(() => CategoryWhereInputSchema) ]).optional(),
});

export default CategoryTranslationWhereInputSchema;
