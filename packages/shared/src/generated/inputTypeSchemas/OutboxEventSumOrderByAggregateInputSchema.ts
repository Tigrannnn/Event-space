import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const OutboxEventSumOrderByAggregateInputSchema: z.ZodType<Prisma.OutboxEventSumOrderByAggregateInput> = z.object({
  attempts: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default OutboxEventSumOrderByAggregateInputSchema;
