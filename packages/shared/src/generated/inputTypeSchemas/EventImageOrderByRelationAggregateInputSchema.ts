import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const EventImageOrderByRelationAggregateInputSchema: z.ZodType<Prisma.EventImageOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default EventImageOrderByRelationAggregateInputSchema;
