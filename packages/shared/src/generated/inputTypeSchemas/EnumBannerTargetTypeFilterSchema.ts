import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerTargetTypeSchema } from './BannerTargetTypeSchema';
import { NestedEnumBannerTargetTypeFilterSchema } from './NestedEnumBannerTargetTypeFilterSchema';

export const EnumBannerTargetTypeFilterSchema: z.ZodType<Prisma.EnumBannerTargetTypeFilter> = z.strictObject({
  equals: z.lazy(() => BannerTargetTypeSchema).optional(),
  in: z.lazy(() => BannerTargetTypeSchema).array().optional(),
  notIn: z.lazy(() => BannerTargetTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => BannerTargetTypeSchema), z.lazy(() => NestedEnumBannerTargetTypeFilterSchema) ]).optional(),
});

export default EnumBannerTargetTypeFilterSchema;
