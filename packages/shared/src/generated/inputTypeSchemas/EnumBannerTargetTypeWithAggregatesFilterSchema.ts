import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerTargetTypeSchema } from './BannerTargetTypeSchema';
import { NestedEnumBannerTargetTypeWithAggregatesFilterSchema } from './NestedEnumBannerTargetTypeWithAggregatesFilterSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumBannerTargetTypeFilterSchema } from './NestedEnumBannerTargetTypeFilterSchema';

export const EnumBannerTargetTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumBannerTargetTypeWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => BannerTargetTypeSchema).optional(),
  in: z.lazy(() => BannerTargetTypeSchema).array().optional(),
  notIn: z.lazy(() => BannerTargetTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => BannerTargetTypeSchema), z.lazy(() => NestedEnumBannerTargetTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumBannerTargetTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumBannerTargetTypeFilterSchema).optional(),
});

export default EnumBannerTargetTypeWithAggregatesFilterSchema;
