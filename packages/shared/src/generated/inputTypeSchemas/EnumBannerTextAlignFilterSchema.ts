import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerTextAlignSchema } from './BannerTextAlignSchema';
import { NestedEnumBannerTextAlignFilterSchema } from './NestedEnumBannerTextAlignFilterSchema';

export const EnumBannerTextAlignFilterSchema: z.ZodType<Prisma.EnumBannerTextAlignFilter> = z.strictObject({
  equals: z.lazy(() => BannerTextAlignSchema).optional(),
  in: z.lazy(() => BannerTextAlignSchema).array().optional(),
  notIn: z.lazy(() => BannerTextAlignSchema).array().optional(),
  not: z.union([ z.lazy(() => BannerTextAlignSchema), z.lazy(() => NestedEnumBannerTextAlignFilterSchema) ]).optional(),
});

export default EnumBannerTextAlignFilterSchema;
