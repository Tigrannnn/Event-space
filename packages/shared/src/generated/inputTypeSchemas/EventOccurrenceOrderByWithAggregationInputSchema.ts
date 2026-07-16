import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { EventOccurrenceCountOrderByAggregateInputSchema } from './EventOccurrenceCountOrderByAggregateInputSchema';
import { EventOccurrenceAvgOrderByAggregateInputSchema } from './EventOccurrenceAvgOrderByAggregateInputSchema';
import { EventOccurrenceMaxOrderByAggregateInputSchema } from './EventOccurrenceMaxOrderByAggregateInputSchema';
import { EventOccurrenceMinOrderByAggregateInputSchema } from './EventOccurrenceMinOrderByAggregateInputSchema';
import { EventOccurrenceSumOrderByAggregateInputSchema } from './EventOccurrenceSumOrderByAggregateInputSchema';

export const EventOccurrenceOrderByWithAggregationInputSchema: z.ZodType<Prisma.EventOccurrenceOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  eventId: z.lazy(() => SortOrderSchema).optional(),
  date: z.lazy(() => SortOrderSchema).optional(),
  maxParticipants: z.lazy(() => SortOrderSchema).optional(),
  currentParticipants: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => EventOccurrenceCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => EventOccurrenceAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => EventOccurrenceMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => EventOccurrenceMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => EventOccurrenceSumOrderByAggregateInputSchema).optional(),
});

export default EventOccurrenceOrderByWithAggregationInputSchema;
