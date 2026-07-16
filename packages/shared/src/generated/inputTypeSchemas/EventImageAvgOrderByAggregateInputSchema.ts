import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const EventImageAvgOrderByAggregateInputSchema: z.ZodType<Prisma.EventImageAvgOrderByAggregateInput> = z.strictObject({
  order: z.lazy(() => SortOrderSchema).optional(),
});

export default EventImageAvgOrderByAggregateInputSchema;
