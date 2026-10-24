import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ReviewSumOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewSumOrderByAggregateInput> = z.strictObject({
  rating: z.lazy(() => SortOrderSchema).optional(),
});

export default ReviewSumOrderByAggregateInputSchema;
