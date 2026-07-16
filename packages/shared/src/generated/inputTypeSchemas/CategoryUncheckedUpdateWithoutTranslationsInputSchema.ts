import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { EventUncheckedUpdateManyWithoutCategoryNestedInputSchema } from './EventUncheckedUpdateManyWithoutCategoryNestedInputSchema';

export const CategoryUncheckedUpdateWithoutTranslationsInputSchema: z.ZodType<Prisma.CategoryUncheckedUpdateWithoutTranslationsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  events: z.lazy(() => EventUncheckedUpdateManyWithoutCategoryNestedInputSchema).optional(),
});

export default CategoryUncheckedUpdateWithoutTranslationsInputSchema;
