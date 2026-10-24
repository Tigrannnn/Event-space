import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerThemeSchema } from './BannerThemeSchema';
import { NestedEnumBannerThemeWithAggregatesFilterSchema } from './NestedEnumBannerThemeWithAggregatesFilterSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumBannerThemeFilterSchema } from './NestedEnumBannerThemeFilterSchema';

export const EnumBannerThemeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumBannerThemeWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => BannerThemeSchema).optional(),
  in: z.lazy(() => BannerThemeSchema).array().optional(),
  notIn: z.lazy(() => BannerThemeSchema).array().optional(),
  not: z.union([ z.lazy(() => BannerThemeSchema), z.lazy(() => NestedEnumBannerThemeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumBannerThemeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumBannerThemeFilterSchema).optional(),
});

export default EnumBannerThemeWithAggregatesFilterSchema;
