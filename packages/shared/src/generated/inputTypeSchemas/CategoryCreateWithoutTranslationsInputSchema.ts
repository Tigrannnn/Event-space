import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateNestedManyWithoutCategoryInputSchema } from './EventCreateNestedManyWithoutCategoryInputSchema';

export const CategoryCreateWithoutTranslationsInputSchema: z.ZodType<Prisma.CategoryCreateWithoutTranslationsInput> = z.strictObject({
  id: z.uuid().optional(),
  slug: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  events: z.lazy(() => EventCreateNestedManyWithoutCategoryInputSchema).optional(),
});

export default CategoryCreateWithoutTranslationsInputSchema;
