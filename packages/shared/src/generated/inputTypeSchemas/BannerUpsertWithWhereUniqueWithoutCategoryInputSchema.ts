import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerWhereUniqueInputSchema } from './BannerWhereUniqueInputSchema';
import { BannerUpdateWithoutCategoryInputSchema } from './BannerUpdateWithoutCategoryInputSchema';
import { BannerUncheckedUpdateWithoutCategoryInputSchema } from './BannerUncheckedUpdateWithoutCategoryInputSchema';
import { BannerCreateWithoutCategoryInputSchema } from './BannerCreateWithoutCategoryInputSchema';
import { BannerUncheckedCreateWithoutCategoryInputSchema } from './BannerUncheckedCreateWithoutCategoryInputSchema';

export const BannerUpsertWithWhereUniqueWithoutCategoryInputSchema: z.ZodType<Prisma.BannerUpsertWithWhereUniqueWithoutCategoryInput> = z.strictObject({
  where: z.lazy(() => BannerWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => BannerUpdateWithoutCategoryInputSchema), z.lazy(() => BannerUncheckedUpdateWithoutCategoryInputSchema) ]),
  create: z.union([ z.lazy(() => BannerCreateWithoutCategoryInputSchema), z.lazy(() => BannerUncheckedCreateWithoutCategoryInputSchema) ]),
});

export default BannerUpsertWithWhereUniqueWithoutCategoryInputSchema;
