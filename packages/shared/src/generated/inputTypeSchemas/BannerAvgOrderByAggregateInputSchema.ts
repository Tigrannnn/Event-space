import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BannerAvgOrderByAggregateInputSchema: z.ZodType<Prisma.BannerAvgOrderByAggregateInput> = z.strictObject({
  sortOrder: z.lazy(() => SortOrderSchema).optional(),
});

export default BannerAvgOrderByAggregateInputSchema;
