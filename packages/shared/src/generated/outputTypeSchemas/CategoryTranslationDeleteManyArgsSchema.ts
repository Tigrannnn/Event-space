import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CategoryTranslationWhereInputSchema } from '../inputTypeSchemas/CategoryTranslationWhereInputSchema'

export const CategoryTranslationDeleteManyArgsSchema: z.ZodType<Prisma.CategoryTranslationDeleteManyArgs> = z.object({
  where: CategoryTranslationWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default CategoryTranslationDeleteManyArgsSchema;
