import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryWhereInputSchema } from './CategoryWhereInputSchema';

export const CategoryScalarRelationFilterSchema: z.ZodType<Prisma.CategoryScalarRelationFilter> = z.object({
  is: z.lazy(() => CategoryWhereInputSchema).optional(),
  isNot: z.lazy(() => CategoryWhereInputSchema).optional(),
}).strict();

export default CategoryScalarRelationFilterSchema;
