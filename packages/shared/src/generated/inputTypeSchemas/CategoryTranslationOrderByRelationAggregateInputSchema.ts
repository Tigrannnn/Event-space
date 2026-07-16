import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const CategoryTranslationOrderByRelationAggregateInputSchema: z.ZodType<Prisma.CategoryTranslationOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export default CategoryTranslationOrderByRelationAggregateInputSchema;
