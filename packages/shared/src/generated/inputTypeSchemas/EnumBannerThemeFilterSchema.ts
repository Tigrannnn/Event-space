import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerThemeSchema } from './BannerThemeSchema';
import { NestedEnumBannerThemeFilterSchema } from './NestedEnumBannerThemeFilterSchema';

export const EnumBannerThemeFilterSchema: z.ZodType<Prisma.EnumBannerThemeFilter> = z.strictObject({
  equals: z.lazy(() => BannerThemeSchema).optional(),
  in: z.lazy(() => BannerThemeSchema).array().optional(),
  notIn: z.lazy(() => BannerThemeSchema).array().optional(),
  not: z.union([ z.lazy(() => BannerThemeSchema), z.lazy(() => NestedEnumBannerThemeFilterSchema) ]).optional(),
});

export default EnumBannerThemeFilterSchema;
