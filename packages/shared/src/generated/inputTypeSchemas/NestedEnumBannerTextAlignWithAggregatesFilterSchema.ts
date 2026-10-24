import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerTextAlignSchema } from './BannerTextAlignSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumBannerTextAlignFilterSchema } from './NestedEnumBannerTextAlignFilterSchema';

export const NestedEnumBannerTextAlignWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumBannerTextAlignWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => BannerTextAlignSchema).optional(),
  in: z.lazy(() => BannerTextAlignSchema).array().optional(),
  notIn: z.lazy(() => BannerTextAlignSchema).array().optional(),
  not: z.union([ z.lazy(() => BannerTextAlignSchema), z.lazy(() => NestedEnumBannerTextAlignWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumBannerTextAlignFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumBannerTextAlignFilterSchema).optional(),
});

export default NestedEnumBannerTextAlignWithAggregatesFilterSchema;
