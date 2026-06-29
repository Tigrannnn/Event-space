import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { LocaleSchema } from './LocaleSchema';
import { EnumLocaleFieldUpdateOperationsInputSchema } from './EnumLocaleFieldUpdateOperationsInputSchema';
import { CategoryUpdateOneRequiredWithoutTranslationsNestedInputSchema } from './CategoryUpdateOneRequiredWithoutTranslationsNestedInputSchema';

export const CategoryTranslationUpdateInputSchema: z.ZodType<Prisma.CategoryTranslationUpdateInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  locale: z.union([ z.lazy(() => LocaleSchema), z.lazy(() => EnumLocaleFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.lazy(() => CategoryUpdateOneRequiredWithoutTranslationsNestedInputSchema).optional(),
}).strict();

export default CategoryTranslationUpdateInputSchema;
