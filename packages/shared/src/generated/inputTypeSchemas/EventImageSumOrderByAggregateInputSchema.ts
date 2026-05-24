import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const EventImageSumOrderByAggregateInputSchema: z.ZodType<Prisma.EventImageSumOrderByAggregateInput> = z.object({
  order: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default EventImageSumOrderByAggregateInputSchema;
