import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryWhereInputSchema } from './CategoryWhereInputSchema';
import { CategoryUpdateWithoutTranslationsInputSchema } from './CategoryUpdateWithoutTranslationsInputSchema';
import { CategoryUncheckedUpdateWithoutTranslationsInputSchema } from './CategoryUncheckedUpdateWithoutTranslationsInputSchema';

export const CategoryUpdateToOneWithWhereWithoutTranslationsInputSchema: z.ZodType<Prisma.CategoryUpdateToOneWithWhereWithoutTranslationsInput> = z.strictObject({
  where: z.lazy(() => CategoryWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => CategoryUpdateWithoutTranslationsInputSchema), z.lazy(() => CategoryUncheckedUpdateWithoutTranslationsInputSchema) ]),
});

export default CategoryUpdateToOneWithWhereWithoutTranslationsInputSchema;
