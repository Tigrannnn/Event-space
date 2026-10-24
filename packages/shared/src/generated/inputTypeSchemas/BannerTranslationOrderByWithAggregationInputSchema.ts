import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { BannerTranslationCountOrderByAggregateInputSchema } from './BannerTranslationCountOrderByAggregateInputSchema';
import { BannerTranslationMaxOrderByAggregateInputSchema } from './BannerTranslationMaxOrderByAggregateInputSchema';
import { BannerTranslationMinOrderByAggregateInputSchema } from './BannerTranslationMinOrderByAggregateInputSchema';

export const BannerTranslationOrderByWithAggregationInputSchema: z.ZodType<Prisma.BannerTranslationOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  bannerId: z.lazy(() => SortOrderSchema).optional(),
  locale: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  subtitle: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => BannerTranslationCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => BannerTranslationMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => BannerTranslationMinOrderByAggregateInputSchema).optional(),
});

export default BannerTranslationOrderByWithAggregationInputSchema;
