import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const EventOccurrenceAvgOrderByAggregateInputSchema: z.ZodType<Prisma.EventOccurrenceAvgOrderByAggregateInput> = z.strictObject({
  maxParticipants: z.lazy(() => SortOrderSchema).optional(),
  currentParticipants: z.lazy(() => SortOrderSchema).optional(),
});

export default EventOccurrenceAvgOrderByAggregateInputSchema;
