import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { FavoriteCountOrderByAggregateInputSchema } from './FavoriteCountOrderByAggregateInputSchema';
import { FavoriteMaxOrderByAggregateInputSchema } from './FavoriteMaxOrderByAggregateInputSchema';
import { FavoriteMinOrderByAggregateInputSchema } from './FavoriteMinOrderByAggregateInputSchema';

export const FavoriteOrderByWithAggregationInputSchema: z.ZodType<Prisma.FavoriteOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  eventId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => FavoriteCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => FavoriteMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => FavoriteMinOrderByAggregateInputSchema).optional(),
});

export default FavoriteOrderByWithAggregationInputSchema;
