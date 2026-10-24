import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BannerTranslationOrderByRelationAggregateInputSchema: z.ZodType<Prisma.BannerTranslationOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export default BannerTranslationOrderByRelationAggregateInputSchema;
