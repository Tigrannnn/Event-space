import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CategoryArgsSchema } from "../outputTypeSchemas/CategoryArgsSchema"

export const CategoryTranslationSelectSchema: z.ZodType<Prisma.CategoryTranslationSelect> = z.object({
  id: z.boolean().optional(),
  categoryId: z.boolean().optional(),
  locale: z.boolean().optional(),
  name: z.boolean().optional(),
  category: z.union([z.boolean(),z.lazy(() => CategoryArgsSchema)]).optional(),
}).strict()

export default CategoryTranslationSelectSchema;
