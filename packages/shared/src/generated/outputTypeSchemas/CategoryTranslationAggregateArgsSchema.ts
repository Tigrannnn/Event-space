import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CategoryTranslationWhereInputSchema } from '../inputTypeSchemas/CategoryTranslationWhereInputSchema'
import { CategoryTranslationOrderByWithRelationInputSchema } from '../inputTypeSchemas/CategoryTranslationOrderByWithRelationInputSchema'
import { CategoryTranslationWhereUniqueInputSchema } from '../inputTypeSchemas/CategoryTranslationWhereUniqueInputSchema'

export const CategoryTranslationAggregateArgsSchema: z.ZodType<Prisma.CategoryTranslationAggregateArgs> = z.object({
  where: CategoryTranslationWhereInputSchema.optional(), 
  orderBy: z.union([ CategoryTranslationOrderByWithRelationInputSchema.array(), CategoryTranslationOrderByWithRelationInputSchema ]).optional(),
  cursor: CategoryTranslationWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default CategoryTranslationAggregateArgsSchema;
