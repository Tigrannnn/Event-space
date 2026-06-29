import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { EventCountOrderByAggregateInputSchema } from './EventCountOrderByAggregateInputSchema';
import { EventAvgOrderByAggregateInputSchema } from './EventAvgOrderByAggregateInputSchema';
import { EventMaxOrderByAggregateInputSchema } from './EventMaxOrderByAggregateInputSchema';
import { EventMinOrderByAggregateInputSchema } from './EventMinOrderByAggregateInputSchema';
import { EventSumOrderByAggregateInputSchema } from './EventSumOrderByAggregateInputSchema';

export const EventOrderByWithAggregationInputSchema: z.ZodType<Prisma.EventOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  locationUrl: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  date: z.lazy(() => SortOrderSchema).optional(),
  difficulty: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  maxParticipants: z.lazy(() => SortOrderSchema).optional(),
  currentParticipants: z.lazy(() => SortOrderSchema).optional(),
  duration: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  categoryId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => EventCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => EventAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => EventMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => EventMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => EventSumOrderByAggregateInputSchema).optional(),
}).strict();

export default EventOrderByWithAggregationInputSchema;
