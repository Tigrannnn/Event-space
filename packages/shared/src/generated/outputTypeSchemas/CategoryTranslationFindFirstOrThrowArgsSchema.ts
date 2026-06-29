import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CategoryTranslationIncludeSchema } from '../inputTypeSchemas/CategoryTranslationIncludeSchema'
import { CategoryTranslationWhereInputSchema } from '../inputTypeSchemas/CategoryTranslationWhereInputSchema'
import { CategoryTranslationOrderByWithRelationInputSchema } from '../inputTypeSchemas/CategoryTranslationOrderByWithRelationInputSchema'
import { CategoryTranslationWhereUniqueInputSchema } from '../inputTypeSchemas/CategoryTranslationWhereUniqueInputSchema'
import { CategoryTranslationScalarFieldEnumSchema } from '../inputTypeSchemas/CategoryTranslationScalarFieldEnumSchema'
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

export const CategoryTranslationFindFirstOrThrowArgsSchema: z.ZodType<Prisma.CategoryTranslationFindFirstOrThrowArgs> = z.object({
  select: CategoryTranslationSelectSchema.optional(),
  include: z.lazy(() => CategoryTranslationIncludeSchema).optional(),
  where: CategoryTranslationWhereInputSchema.optional(), 
  orderBy: z.union([ CategoryTranslationOrderByWithRelationInputSchema.array(), CategoryTranslationOrderByWithRelationInputSchema ]).optional(),
  cursor: CategoryTranslationWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CategoryTranslationScalarFieldEnumSchema, CategoryTranslationScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export default CategoryTranslationFindFirstOrThrowArgsSchema;
