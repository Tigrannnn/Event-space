import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { CategoryTranslationCountOrderByAggregateInputSchema } from './CategoryTranslationCountOrderByAggregateInputSchema';
import { CategoryTranslationMaxOrderByAggregateInputSchema } from './CategoryTranslationMaxOrderByAggregateInputSchema';
import { CategoryTranslationMinOrderByAggregateInputSchema } from './CategoryTranslationMinOrderByAggregateInputSchema';

export const CategoryTranslationOrderByWithAggregationInputSchema: z.ZodType<Prisma.CategoryTranslationOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  categoryId: z.lazy(() => SortOrderSchema).optional(),
  locale: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => CategoryTranslationCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => CategoryTranslationMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => CategoryTranslationMinOrderByAggregateInputSchema).optional(),
}).strict();

export default CategoryTranslationOrderByWithAggregationInputSchema;
