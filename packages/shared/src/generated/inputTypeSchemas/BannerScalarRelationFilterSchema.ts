import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerWhereInputSchema } from './BannerWhereInputSchema';

export const BannerScalarRelationFilterSchema: z.ZodType<Prisma.BannerScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => BannerWhereInputSchema).optional(),
  isNot: z.lazy(() => BannerWhereInputSchema).optional(),
});

export default BannerScalarRelationFilterSchema;
