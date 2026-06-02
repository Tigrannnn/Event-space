import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const OutboxEventAvgOrderByAggregateInputSchema: z.ZodType<Prisma.OutboxEventAvgOrderByAggregateInput> = z.object({
  attempts: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default OutboxEventAvgOrderByAggregateInputSchema;
