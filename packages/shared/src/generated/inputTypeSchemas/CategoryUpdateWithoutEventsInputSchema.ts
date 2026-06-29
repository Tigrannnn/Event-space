import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { CategoryTranslationUpdateManyWithoutCategoryNestedInputSchema } from './CategoryTranslationUpdateManyWithoutCategoryNestedInputSchema';

export const CategoryUpdateWithoutEventsInputSchema: z.ZodType<Prisma.CategoryUpdateWithoutEventsInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  translations: z.lazy(() => CategoryTranslationUpdateManyWithoutCategoryNestedInputSchema).optional(),
}).strict();

export default CategoryUpdateWithoutEventsInputSchema;
