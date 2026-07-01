import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const EventOccurrenceOrderByRelationAggregateInputSchema: z.ZodType<Prisma.EventOccurrenceOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default EventOccurrenceOrderByRelationAggregateInputSchema;
