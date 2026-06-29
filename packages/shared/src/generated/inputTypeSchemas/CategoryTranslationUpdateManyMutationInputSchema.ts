import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { LocaleSchema } from './LocaleSchema';
import { EnumLocaleFieldUpdateOperationsInputSchema } from './EnumLocaleFieldUpdateOperationsInputSchema';

export const CategoryTranslationUpdateManyMutationInputSchema: z.ZodType<Prisma.CategoryTranslationUpdateManyMutationInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  locale: z.union([ z.lazy(() => LocaleSchema), z.lazy(() => EnumLocaleFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export default CategoryTranslationUpdateManyMutationInputSchema;
