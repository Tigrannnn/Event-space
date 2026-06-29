import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryWhereUniqueInputSchema } from './CategoryWhereUniqueInputSchema';
import { CategoryCreateWithoutTranslationsInputSchema } from './CategoryCreateWithoutTranslationsInputSchema';
import { CategoryUncheckedCreateWithoutTranslationsInputSchema } from './CategoryUncheckedCreateWithoutTranslationsInputSchema';

export const CategoryCreateOrConnectWithoutTranslationsInputSchema: z.ZodType<Prisma.CategoryCreateOrConnectWithoutTranslationsInput> = z.object({
  where: z.lazy(() => CategoryWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CategoryCreateWithoutTranslationsInputSchema), z.lazy(() => CategoryUncheckedCreateWithoutTranslationsInputSchema) ]),
}).strict();

export default CategoryCreateOrConnectWithoutTranslationsInputSchema;
