import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryTranslationCategoryIdLocaleCompoundUniqueInputSchema } from './CategoryTranslationCategoryIdLocaleCompoundUniqueInputSchema';
import { CategoryTranslationWhereInputSchema } from './CategoryTranslationWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumLocaleFilterSchema } from './EnumLocaleFilterSchema';
import { LocaleSchema } from './LocaleSchema';
import { CategoryScalarRelationFilterSchema } from './CategoryScalarRelationFilterSchema';
import { CategoryWhereInputSchema } from './CategoryWhereInputSchema';

export const CategoryTranslationWhereUniqueInputSchema: z.ZodType<Prisma.CategoryTranslationWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    categoryId_locale: z.lazy(() => CategoryTranslationCategoryIdLocaleCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    categoryId_locale: z.lazy(() => CategoryTranslationCategoryIdLocaleCompoundUniqueInputSchema),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  categoryId_locale: z.lazy(() => CategoryTranslationCategoryIdLocaleCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => CategoryTranslationWhereInputSchema), z.lazy(() => CategoryTranslationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CategoryTranslationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CategoryTranslationWhereInputSchema), z.lazy(() => CategoryTranslationWhereInputSchema).array() ]).optional(),
  categoryId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  locale: z.union([ z.lazy(() => EnumLocaleFilterSchema), z.lazy(() => LocaleSchema) ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  category: z.union([ z.lazy(() => CategoryScalarRelationFilterSchema), z.lazy(() => CategoryWhereInputSchema) ]).optional(),
}));

export default CategoryTranslationWhereUniqueInputSchema;
