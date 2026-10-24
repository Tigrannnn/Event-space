import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ReviewAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewAvgOrderByAggregateInput> = z.strictObject({
  rating: z.lazy(() => SortOrderSchema).optional(),
});

export default ReviewAvgOrderByAggregateInputSchema;
