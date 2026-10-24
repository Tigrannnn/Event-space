import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerTextAlignSchema } from './BannerTextAlignSchema';
import { NestedEnumBannerTextAlignWithAggregatesFilterSchema } from './NestedEnumBannerTextAlignWithAggregatesFilterSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumBannerTextAlignFilterSchema } from './NestedEnumBannerTextAlignFilterSchema';

export const EnumBannerTextAlignWithAggregatesFilterSchema: z.ZodType<Prisma.EnumBannerTextAlignWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => BannerTextAlignSchema).optional(),
  in: z.lazy(() => BannerTextAlignSchema).array().optional(),
  notIn: z.lazy(() => BannerTextAlignSchema).array().optional(),
  not: z.union([ z.lazy(() => BannerTextAlignSchema), z.lazy(() => NestedEnumBannerTextAlignWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumBannerTextAlignFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumBannerTextAlignFilterSchema).optional(),
});

export default EnumBannerTextAlignWithAggregatesFilterSchema;
