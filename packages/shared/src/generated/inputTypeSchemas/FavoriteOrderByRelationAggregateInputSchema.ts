import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const FavoriteOrderByRelationAggregateInputSchema: z.ZodType<Prisma.FavoriteOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export default FavoriteOrderByRelationAggregateInputSchema;
