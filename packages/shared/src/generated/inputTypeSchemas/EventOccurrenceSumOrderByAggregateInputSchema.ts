import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const EventOccurrenceSumOrderByAggregateInputSchema: z.ZodType<Prisma.EventOccurrenceSumOrderByAggregateInput> = z.object({
  maxParticipants: z.lazy(() => SortOrderSchema).optional(),
  currentParticipants: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default EventOccurrenceSumOrderByAggregateInputSchema;
