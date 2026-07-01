import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const EventSumOrderByAggregateInputSchema: z.ZodType<Prisma.EventSumOrderByAggregateInput> = z.object({
  price: z.lazy(() => SortOrderSchema).optional(),
  duration: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default EventSumOrderByAggregateInputSchema;
