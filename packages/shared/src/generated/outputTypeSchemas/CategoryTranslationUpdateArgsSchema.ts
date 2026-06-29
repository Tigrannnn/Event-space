import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CategoryTranslationIncludeSchema } from '../inputTypeSchemas/CategoryTranslationIncludeSchema'
import { CategoryTranslationUpdateInputSchema } from '../inputTypeSchemas/CategoryTranslationUpdateInputSchema'
import { CategoryTranslationUncheckedUpdateInputSchema } from '../inputTypeSchemas/CategoryTranslationUncheckedUpdateInputSchema'
import { CategoryTranslationWhereUniqueInputSchema } from '../inputTypeSchemas/CategoryTranslationWhereUniqueInputSchema'
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

export const CategoryTranslationUpdateArgsSchema: z.ZodType<Prisma.CategoryTranslationUpdateArgs> = z.object({
  select: CategoryTranslationSelectSchema.optional(),
  include: z.lazy(() => CategoryTranslationIncludeSchema).optional(),
  data: z.union([ CategoryTranslationUpdateInputSchema, CategoryTranslationUncheckedUpdateInputSchema ]),
  where: CategoryTranslationWhereUniqueInputSchema, 
}).strict();

export default CategoryTranslationUpdateArgsSchema;
