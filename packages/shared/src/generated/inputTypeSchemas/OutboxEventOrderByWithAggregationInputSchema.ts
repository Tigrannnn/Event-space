import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { OutboxEventCountOrderByAggregateInputSchema } from './OutboxEventCountOrderByAggregateInputSchema';
import { OutboxEventAvgOrderByAggregateInputSchema } from './OutboxEventAvgOrderByAggregateInputSchema';
import { OutboxEventMaxOrderByAggregateInputSchema } from './OutboxEventMaxOrderByAggregateInputSchema';
import { OutboxEventMinOrderByAggregateInputSchema } from './OutboxEventMinOrderByAggregateInputSchema';
import { OutboxEventSumOrderByAggregateInputSchema } from './OutboxEventSumOrderByAggregateInputSchema';

export const OutboxEventOrderByWithAggregationInputSchema: z.ZodType<Prisma.OutboxEventOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  action: z.lazy(() => SortOrderSchema).optional(),
  payload: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  attempts: z.lazy(() => SortOrderSchema).optional(),
  lastError: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  processedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => OutboxEventCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => OutboxEventAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => OutboxEventMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => OutboxEventMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => OutboxEventSumOrderByAggregateInputSchema).optional(),
}).strict();

export default OutboxEventOrderByWithAggregationInputSchema;
