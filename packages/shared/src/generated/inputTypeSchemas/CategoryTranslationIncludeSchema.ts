import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CategoryArgsSchema } from "../outputTypeSchemas/CategoryArgsSchema"

export const CategoryTranslationIncludeSchema: z.ZodType<Prisma.CategoryTranslationInclude> = z.object({
  category: z.union([z.boolean(),z.lazy(() => CategoryArgsSchema)]).optional(),
}).strict();

export default CategoryTranslationIncludeSchema;
