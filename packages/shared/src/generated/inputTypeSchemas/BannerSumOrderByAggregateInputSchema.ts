import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BannerSumOrderByAggregateInputSchema: z.ZodType<Prisma.BannerSumOrderByAggregateInput> = z.strictObject({
  sortOrder: z.lazy(() => SortOrderSchema).optional(),
});

export default BannerSumOrderByAggregateInputSchema;
