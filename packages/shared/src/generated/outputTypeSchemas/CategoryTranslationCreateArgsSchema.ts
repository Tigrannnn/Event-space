import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CategoryTranslationIncludeSchema } from '../inputTypeSchemas/CategoryTranslationIncludeSchema'
import { CategoryTranslationCreateInputSchema } from '../inputTypeSchemas/CategoryTranslationCreateInputSchema'
import { CategoryTranslationUncheckedCreateInputSchema } from '../inputTypeSchemas/CategoryTranslationUncheckedCreateInputSchema'
import { CategoryArgsSchema } from "../outputTypeSchemas/CategoryArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const CategoryTranslationSelectSchema: z.ZodType<Prisma.CategoryTranslationSelect> = z.object({
  id: z.boolean().optional(),
  categoryId: z.boolean().optional(),
  locale: z.boolean().optional(),
  name: z.boolean().optional(),
  category: z.union([z.boolean(),z.lazy(() => CategoryArgsSchema)]).optional(),
}).strict()

export const CategoryTranslationCreateArgsSchema: z.ZodType<Prisma.CategoryTranslationCreateArgs> = z.object({
  select: CategoryTranslationSelectSchema.optional(),
  include: z.lazy(() => CategoryTranslationIncludeSchema).optional(),
  data: z.union([ CategoryTranslationCreateInputSchema, CategoryTranslationUncheckedCreateInputSchema ]),
}).strict();

export default CategoryTranslationCreateArgsSchema;
