import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerTargetTypeSchema } from './BannerTargetTypeSchema';

export const NestedEnumBannerTargetTypeFilterSchema: z.ZodType<Prisma.NestedEnumBannerTargetTypeFilter> = z.strictObject({
  equals: z.lazy(() => BannerTargetTypeSchema).optional(),
  in: z.lazy(() => BannerTargetTypeSchema).array().optional(),
  notIn: z.lazy(() => BannerTargetTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => BannerTargetTypeSchema), z.lazy(() => NestedEnumBannerTargetTypeFilterSchema) ]).optional(),
});

export default NestedEnumBannerTargetTypeFilterSchema;
