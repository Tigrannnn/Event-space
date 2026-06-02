import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const OutboxEventMaxOrderByAggregateInputSchema: z.ZodType<Prisma.OutboxEventMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  action: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  attempts: z.lazy(() => SortOrderSchema).optional(),
  lastError: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  processedAt: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default OutboxEventMaxOrderByAggregateInputSchema;
