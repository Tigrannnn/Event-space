import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CategoryTranslationUpdateManyMutationInputSchema } from '../inputTypeSchemas/CategoryTranslationUpdateManyMutationInputSchema'
import { CategoryTranslationUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/CategoryTranslationUncheckedUpdateManyInputSchema'
import { CategoryTranslationWhereInputSchema } from '../inputTypeSchemas/CategoryTranslationWhereInputSchema'

export const CategoryTranslationUpdateManyArgsSchema: z.ZodType<Prisma.CategoryTranslationUpdateManyArgs> = z.object({
  data: z.union([ CategoryTranslationUpdateManyMutationInputSchema, CategoryTranslationUncheckedUpdateManyInputSchema ]),
  where: CategoryTranslationWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default CategoryTranslationUpdateManyArgsSchema;
