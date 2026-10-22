import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumLocaleFilterSchema } from './EnumLocaleFilterSchema';
import { LocaleSchema } from './LocaleSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';

export const CategoryTranslationScalarWhereInputSchema: z.ZodType<Prisma.CategoryTranslationScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CategoryTranslationScalarWhereInputSchema), z.lazy(() => CategoryTranslationScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CategoryTranslationScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CategoryTranslationScalarWhereInputSchema), z.lazy(() => CategoryTranslationScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  categoryId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  locale: z.union([ z.lazy(() => EnumLocaleFilterSchema), z.lazy(() => LocaleSchema) ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
});

export default CategoryTranslationScalarWhereInputSchema;
