import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventUncheckedCreateNestedManyWithoutCategoryInputSchema } from './EventUncheckedCreateNestedManyWithoutCategoryInputSchema';

export const CategoryUncheckedCreateWithoutTranslationsInputSchema: z.ZodType<Prisma.CategoryUncheckedCreateWithoutTranslationsInput> = z.object({
  id: z.uuid().optional(),
  slug: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  events: z.lazy(() => EventUncheckedCreateNestedManyWithoutCategoryInputSchema).optional(),
}).strict();

export default CategoryUncheckedCreateWithoutTranslationsInputSchema;
