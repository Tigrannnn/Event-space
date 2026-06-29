import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CategoryTranslationSelectSchema } from '../inputTypeSchemas/CategoryTranslationSelectSchema';
import { CategoryTranslationIncludeSchema } from '../inputTypeSchemas/CategoryTranslationIncludeSchema';

export const CategoryTranslationArgsSchema: z.ZodType<Prisma.CategoryTranslationDefaultArgs> = z.object({
  select: z.lazy(() => CategoryTranslationSelectSchema).optional(),
  include: z.lazy(() => CategoryTranslationIncludeSchema).optional(),
}).strict();

export default CategoryTranslationArgsSchema;
