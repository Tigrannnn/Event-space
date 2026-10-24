import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerWhereInputSchema } from './BannerWhereInputSchema';

export const BannerListRelationFilterSchema: z.ZodType<Prisma.BannerListRelationFilter> = z.strictObject({
  every: z.lazy(() => BannerWhereInputSchema).optional(),
  some: z.lazy(() => BannerWhereInputSchema).optional(),
  none: z.lazy(() => BannerWhereInputSchema).optional(),
});

export default BannerListRelationFilterSchema;
