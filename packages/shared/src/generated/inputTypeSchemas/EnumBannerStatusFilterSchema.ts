import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerStatusSchema } from './BannerStatusSchema';
import { NestedEnumBannerStatusFilterSchema } from './NestedEnumBannerStatusFilterSchema';

export const EnumBannerStatusFilterSchema: z.ZodType<Prisma.EnumBannerStatusFilter> = z.strictObject({
  equals: z.lazy(() => BannerStatusSchema).optional(),
  in: z.lazy(() => BannerStatusSchema).array().optional(),
  notIn: z.lazy(() => BannerStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => BannerStatusSchema), z.lazy(() => NestedEnumBannerStatusFilterSchema) ]).optional(),
});

export default EnumBannerStatusFilterSchema;
