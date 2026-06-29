import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { CategoryTranslationUncheckedUpdateManyWithoutCategoryNestedInputSchema } from './CategoryTranslationUncheckedUpdateManyWithoutCategoryNestedInputSchema';
import { EventUncheckedUpdateManyWithoutCategoryNestedInputSchema } from './EventUncheckedUpdateManyWithoutCategoryNestedInputSchema';

export const CategoryUncheckedUpdateInputSchema: z.ZodType<Prisma.CategoryUncheckedUpdateInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  translations: z.lazy(() => CategoryTranslationUncheckedUpdateManyWithoutCategoryNestedInputSchema).optional(),
  events: z.lazy(() => EventUncheckedUpdateManyWithoutCategoryNestedInputSchema).optional(),
}).strict();

export default CategoryUncheckedUpdateInputSchema;
