import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryUpdateWithoutTranslationsInputSchema } from './CategoryUpdateWithoutTranslationsInputSchema';
import { CategoryUncheckedUpdateWithoutTranslationsInputSchema } from './CategoryUncheckedUpdateWithoutTranslationsInputSchema';
import { CategoryCreateWithoutTranslationsInputSchema } from './CategoryCreateWithoutTranslationsInputSchema';
import { CategoryUncheckedCreateWithoutTranslationsInputSchema } from './CategoryUncheckedCreateWithoutTranslationsInputSchema';
import { CategoryWhereInputSchema } from './CategoryWhereInputSchema';

export const CategoryUpsertWithoutTranslationsInputSchema: z.ZodType<Prisma.CategoryUpsertWithoutTranslationsInput> = z.object({
  update: z.union([ z.lazy(() => CategoryUpdateWithoutTranslationsInputSchema), z.lazy(() => CategoryUncheckedUpdateWithoutTranslationsInputSchema) ]),
  create: z.union([ z.lazy(() => CategoryCreateWithoutTranslationsInputSchema), z.lazy(() => CategoryUncheckedCreateWithoutTranslationsInputSchema) ]),
  where: z.lazy(() => CategoryWhereInputSchema).optional(),
}).strict();

export default CategoryUpsertWithoutTranslationsInputSchema;
