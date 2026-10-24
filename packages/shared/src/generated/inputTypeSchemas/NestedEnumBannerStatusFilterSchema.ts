import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerStatusSchema } from './BannerStatusSchema';

export const NestedEnumBannerStatusFilterSchema: z.ZodType<Prisma.NestedEnumBannerStatusFilter> = z.strictObject({
  equals: z.lazy(() => BannerStatusSchema).optional(),
  in: z.lazy(() => BannerStatusSchema).array().optional(),
  notIn: z.lazy(() => BannerStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => BannerStatusSchema), z.lazy(() => NestedEnumBannerStatusFilterSchema) ]).optional(),
});

export default NestedEnumBannerStatusFilterSchema;
