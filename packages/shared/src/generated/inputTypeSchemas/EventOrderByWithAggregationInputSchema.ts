import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { EventCountOrderByAggregateInputSchema } from './EventCountOrderByAggregateInputSchema';
import { EventAvgOrderByAggregateInputSchema } from './EventAvgOrderByAggregateInputSchema';
import { EventMaxOrderByAggregateInputSchema } from './EventMaxOrderByAggregateInputSchema';
import { EventMinOrderByAggregateInputSchema } from './EventMinOrderByAggregateInputSchema';
import { EventSumOrderByAggregateInputSchema } from './EventSumOrderByAggregateInputSchema';

export const EventOrderByWithAggregationInputSchema: z.ZodType<Prisma.EventOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  locationUrl: z.lazy(() => SortOrderSchema).optional(),
  meetingLocationUrl: z.lazy(() => SortOrderSchema).optional(),
  difficulty: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  duration: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  ratingSum: z.lazy(() => SortOrderSchema).optional(),
  ratingCount: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  categoryId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => EventCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => EventAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => EventMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => EventMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => EventSumOrderByAggregateInputSchema).optional(),
});

export default EventOrderByWithAggregationInputSchema;
