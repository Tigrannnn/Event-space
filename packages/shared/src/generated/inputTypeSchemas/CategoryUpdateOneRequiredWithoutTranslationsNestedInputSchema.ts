import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryCreateWithoutTranslationsInputSchema } from './CategoryCreateWithoutTranslationsInputSchema';
import { CategoryUncheckedCreateWithoutTranslationsInputSchema } from './CategoryUncheckedCreateWithoutTranslationsInputSchema';
import { CategoryCreateOrConnectWithoutTranslationsInputSchema } from './CategoryCreateOrConnectWithoutTranslationsInputSchema';
import { CategoryUpsertWithoutTranslationsInputSchema } from './CategoryUpsertWithoutTranslationsInputSchema';
import { CategoryWhereUniqueInputSchema } from './CategoryWhereUniqueInputSchema';
import { CategoryUpdateToOneWithWhereWithoutTranslationsInputSchema } from './CategoryUpdateToOneWithWhereWithoutTranslationsInputSchema';
import { CategoryUpdateWithoutTranslationsInputSchema } from './CategoryUpdateWithoutTranslationsInputSchema';
import { CategoryUncheckedUpdateWithoutTranslationsInputSchema } from './CategoryUncheckedUpdateWithoutTranslationsInputSchema';

export const CategoryUpdateOneRequiredWithoutTranslationsNestedInputSchema: z.ZodType<Prisma.CategoryUpdateOneRequiredWithoutTranslationsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CategoryCreateWithoutTranslationsInputSchema), z.lazy(() => CategoryUncheckedCreateWithoutTranslationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CategoryCreateOrConnectWithoutTranslationsInputSchema).optional(),
  upsert: z.lazy(() => CategoryUpsertWithoutTranslationsInputSchema).optional(),
  connect: z.lazy(() => CategoryWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CategoryUpdateToOneWithWhereWithoutTranslationsInputSchema), z.lazy(() => CategoryUpdateWithoutTranslationsInputSchema), z.lazy(() => CategoryUncheckedUpdateWithoutTranslationsInputSchema) ]).optional(),
});

export default CategoryUpdateOneRequiredWithoutTranslationsNestedInputSchema;
