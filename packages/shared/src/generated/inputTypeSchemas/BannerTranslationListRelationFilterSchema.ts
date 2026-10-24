import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerTranslationWhereInputSchema } from './BannerTranslationWhereInputSchema';

export const BannerTranslationListRelationFilterSchema: z.ZodType<Prisma.BannerTranslationListRelationFilter> = z.strictObject({
  every: z.lazy(() => BannerTranslationWhereInputSchema).optional(),
  some: z.lazy(() => BannerTranslationWhereInputSchema).optional(),
  none: z.lazy(() => BannerTranslationWhereInputSchema).optional(),
});

export default BannerTranslationListRelationFilterSchema;
