import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CategoryUpdateManyMutationInputSchema } from '../inputTypeSchemas/CategoryUpdateManyMutationInputSchema'
import { CategoryUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/CategoryUncheckedUpdateManyInputSchema'
import { CategoryWhereInputSchema } from '../inputTypeSchemas/CategoryWhereInputSchema'

export const CategoryUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.CategoryUpdateManyAndReturnArgs> = z.object({
  data: z.union([ CategoryUpdateManyMutationInputSchema, CategoryUncheckedUpdateManyInputSchema ]),
  where: CategoryWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default CategoryUpdateManyAndReturnArgsSchema;
