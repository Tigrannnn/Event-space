import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BannerOrderByRelationAggregateInputSchema: z.ZodType<Prisma.BannerOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export default BannerOrderByRelationAggregateInputSchema;
