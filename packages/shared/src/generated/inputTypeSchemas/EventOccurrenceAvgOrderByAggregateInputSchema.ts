import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const EventOccurrenceAvgOrderByAggregateInputSchema: z.ZodType<Prisma.EventOccurrenceAvgOrderByAggregateInput> = z.object({
  maxParticipants: z.lazy(() => SortOrderSchema).optional(),
  currentParticipants: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default EventOccurrenceAvgOrderByAggregateInputSchema;
