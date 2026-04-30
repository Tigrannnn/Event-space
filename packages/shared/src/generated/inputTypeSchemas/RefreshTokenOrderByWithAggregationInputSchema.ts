import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { RefreshTokenCountOrderByAggregateInputSchema } from './RefreshTokenCountOrderByAggregateInputSchema';
import { RefreshTokenMaxOrderByAggregateInputSchema } from './RefreshTokenMaxOrderByAggregateInputSchema';
import { RefreshTokenMinOrderByAggregateInputSchema } from './RefreshTokenMinOrderByAggregateInputSchema';

export const RefreshTokenOrderByWithAggregationInputSchema: z.ZodType<Prisma.RefreshTokenOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  hashedToken: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => RefreshTokenCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => RefreshTokenMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => RefreshTokenMinOrderByAggregateInputSchema).optional(),
}).strict();

export default RefreshTokenOrderByWithAggregationInputSchema;
