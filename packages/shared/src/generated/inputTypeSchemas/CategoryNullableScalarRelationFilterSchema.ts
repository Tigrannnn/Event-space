import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryWhereInputSchema } from './CategoryWhereInputSchema';

export const CategoryNullableScalarRelationFilterSchema: z.ZodType<Prisma.CategoryNullableScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => CategoryWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => CategoryWhereInputSchema).optional().nullable(),
});

export default CategoryNullableScalarRelationFilterSchema;
