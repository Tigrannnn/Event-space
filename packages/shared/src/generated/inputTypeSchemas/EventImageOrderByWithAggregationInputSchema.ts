import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { EventImageCountOrderByAggregateInputSchema } from './EventImageCountOrderByAggregateInputSchema';
import { EventImageAvgOrderByAggregateInputSchema } from './EventImageAvgOrderByAggregateInputSchema';
import { EventImageMaxOrderByAggregateInputSchema } from './EventImageMaxOrderByAggregateInputSchema';
import { EventImageMinOrderByAggregateInputSchema } from './EventImageMinOrderByAggregateInputSchema';
import { EventImageSumOrderByAggregateInputSchema } from './EventImageSumOrderByAggregateInputSchema';

export const EventImageOrderByWithAggregationInputSchema: z.ZodType<Prisma.EventImageOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  eventId: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  publicId: z.lazy(() => SortOrderSchema).optional(),
  order: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => EventImageCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => EventImageAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => EventImageMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => EventImageMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => EventImageSumOrderByAggregateInputSchema).optional(),
});

export default EventImageOrderByWithAggregationInputSchema;
