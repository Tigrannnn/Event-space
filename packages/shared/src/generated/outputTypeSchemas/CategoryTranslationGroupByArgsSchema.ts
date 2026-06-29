import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CategoryTranslationWhereInputSchema } from '../inputTypeSchemas/CategoryTranslationWhereInputSchema'
import { CategoryTranslationOrderByWithAggregationInputSchema } from '../inputTypeSchemas/CategoryTranslationOrderByWithAggregationInputSchema'
import { CategoryTranslationScalarFieldEnumSchema } from '../inputTypeSchemas/CategoryTranslationScalarFieldEnumSchema'
import { CategoryTranslationScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/CategoryTranslationScalarWhereWithAggregatesInputSchema'

export const CategoryTranslationGroupByArgsSchema: z.ZodType<Prisma.CategoryTranslationGroupByArgs> = z.object({
  where: CategoryTranslationWhereInputSchema.optional(), 
  orderBy: z.union([ CategoryTranslationOrderByWithAggregationInputSchema.array(), CategoryTranslationOrderByWithAggregationInputSchema ]).optional(),
  by: CategoryTranslationScalarFieldEnumSchema.array(), 
  having: CategoryTranslationScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default CategoryTranslationGroupByArgsSchema;
