import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const EventImageAvgOrderByAggregateInputSchema: z.ZodType<Prisma.EventImageAvgOrderByAggregateInput> = z.object({
  order: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default EventImageAvgOrderByAggregateInputSchema;
