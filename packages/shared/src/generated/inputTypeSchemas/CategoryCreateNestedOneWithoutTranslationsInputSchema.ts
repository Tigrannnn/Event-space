import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryCreateWithoutTranslationsInputSchema } from './CategoryCreateWithoutTranslationsInputSchema';
import { CategoryUncheckedCreateWithoutTranslationsInputSchema } from './CategoryUncheckedCreateWithoutTranslationsInputSchema';
import { CategoryCreateOrConnectWithoutTranslationsInputSchema } from './CategoryCreateOrConnectWithoutTranslationsInputSchema';
import { CategoryWhereUniqueInputSchema } from './CategoryWhereUniqueInputSchema';

export const CategoryCreateNestedOneWithoutTranslationsInputSchema: z.ZodType<Prisma.CategoryCreateNestedOneWithoutTranslationsInput> = z.strictObject({
  create: z.union([ z.lazy(() => CategoryCreateWithoutTranslationsInputSchema), z.lazy(() => CategoryUncheckedCreateWithoutTranslationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CategoryCreateOrConnectWithoutTranslationsInputSchema).optional(),
  connect: z.lazy(() => CategoryWhereUniqueInputSchema).optional(),
});

export default CategoryCreateNestedOneWithoutTranslationsInputSchema;
