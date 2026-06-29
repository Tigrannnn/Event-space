import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CategoryTranslationIncludeSchema } from '../inputTypeSchemas/CategoryTranslationIncludeSchema'
import { CategoryTranslationWhereUniqueInputSchema } from '../inputTypeSchemas/CategoryTranslationWhereUniqueInputSchema'
import { CategoryTranslationCreateInputSchema } from '../inputTypeSchemas/CategoryTranslationCreateInputSchema'
import { CategoryTranslationUncheckedCreateInputSchema } from '../inputTypeSchemas/CategoryTranslationUncheckedCreateInputSchema'
import { CategoryTranslationUpdateInputSchema } from '../inputTypeSchemas/CategoryTranslationUpdateInputSchema'
import { CategoryTranslationUncheckedUpdateInputSchema } from '../inputTypeSchemas/CategoryTranslationUncheckedUpdateInputSchema'
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

export const CategoryTranslationUpsertArgsSchema: z.ZodType<Prisma.CategoryTranslationUpsertArgs> = z.object({
  select: CategoryTranslationSelectSchema.optional(),
  include: z.lazy(() => CategoryTranslationIncludeSchema).optional(),
  where: CategoryTranslationWhereUniqueInputSchema, 
  create: z.union([ CategoryTranslationCreateInputSchema, CategoryTranslationUncheckedCreateInputSchema ]),
  update: z.union([ CategoryTranslationUpdateInputSchema, CategoryTranslationUncheckedUpdateInputSchema ]),
}).strict();

export default CategoryTranslationUpsertArgsSchema;
