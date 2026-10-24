import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerThemeSchema } from './BannerThemeSchema';

export const NestedEnumBannerThemeFilterSchema: z.ZodType<Prisma.NestedEnumBannerThemeFilter> = z.strictObject({
  equals: z.lazy(() => BannerThemeSchema).optional(),
  in: z.lazy(() => BannerThemeSchema).array().optional(),
  notIn: z.lazy(() => BannerThemeSchema).array().optional(),
  not: z.union([ z.lazy(() => BannerThemeSchema), z.lazy(() => NestedEnumBannerThemeFilterSchema) ]).optional(),
});

export default NestedEnumBannerThemeFilterSchema;
