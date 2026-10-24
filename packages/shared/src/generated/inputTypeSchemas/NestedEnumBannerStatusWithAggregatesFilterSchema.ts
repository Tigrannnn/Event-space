import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerStatusSchema } from './BannerStatusSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumBannerStatusFilterSchema } from './NestedEnumBannerStatusFilterSchema';

export const NestedEnumBannerStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumBannerStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => BannerStatusSchema).optional(),
  in: z.lazy(() => BannerStatusSchema).array().optional(),
  notIn: z.lazy(() => BannerStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => BannerStatusSchema), z.lazy(() => NestedEnumBannerStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumBannerStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumBannerStatusFilterSchema).optional(),
});

export default NestedEnumBannerStatusWithAggregatesFilterSchema;
