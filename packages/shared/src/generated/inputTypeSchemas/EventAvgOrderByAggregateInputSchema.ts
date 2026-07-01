import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const EventAvgOrderByAggregateInputSchema: z.ZodType<Prisma.EventAvgOrderByAggregateInput> = z.object({
  price: z.lazy(() => SortOrderSchema).optional(),
  duration: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default EventAvgOrderByAggregateInputSchema;
