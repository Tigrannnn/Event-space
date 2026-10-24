import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerWhereUniqueInputSchema } from './BannerWhereUniqueInputSchema';
import { BannerUpdateWithoutCategoryInputSchema } from './BannerUpdateWithoutCategoryInputSchema';
import { BannerUncheckedUpdateWithoutCategoryInputSchema } from './BannerUncheckedUpdateWithoutCategoryInputSchema';

export const BannerUpdateWithWhereUniqueWithoutCategoryInputSchema: z.ZodType<Prisma.BannerUpdateWithWhereUniqueWithoutCategoryInput> = z.strictObject({
  where: z.lazy(() => BannerWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => BannerUpdateWithoutCategoryInputSchema), z.lazy(() => BannerUncheckedUpdateWithoutCategoryInputSchema) ]),
});

export default BannerUpdateWithWhereUniqueWithoutCategoryInputSchema;
