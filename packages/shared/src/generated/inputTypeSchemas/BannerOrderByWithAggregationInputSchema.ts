import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { BannerCountOrderByAggregateInputSchema } from './BannerCountOrderByAggregateInputSchema';
import { BannerAvgOrderByAggregateInputSchema } from './BannerAvgOrderByAggregateInputSchema';
import { BannerMaxOrderByAggregateInputSchema } from './BannerMaxOrderByAggregateInputSchema';
import { BannerMinOrderByAggregateInputSchema } from './BannerMinOrderByAggregateInputSchema';
import { BannerSumOrderByAggregateInputSchema } from './BannerSumOrderByAggregateInputSchema';

export const BannerOrderByWithAggregationInputSchema: z.ZodType<Prisma.BannerOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  imageUrl: z.lazy(() => SortOrderSchema).optional(),
  imagePublicId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  sortOrder: z.lazy(() => SortOrderSchema).optional(),
  startsAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  endsAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  targetType: z.lazy(() => SortOrderSchema).optional(),
  eventId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  categoryId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  url: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  textAlign: z.lazy(() => SortOrderSchema).optional(),
  theme: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => BannerCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => BannerAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => BannerMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => BannerMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => BannerSumOrderByAggregateInputSchema).optional(),
});

export default BannerOrderByWithAggregationInputSchema;
