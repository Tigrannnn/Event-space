import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerWhereUniqueInputSchema } from './BannerWhereUniqueInputSchema';
import { BannerCreateWithoutCategoryInputSchema } from './BannerCreateWithoutCategoryInputSchema';
import { BannerUncheckedCreateWithoutCategoryInputSchema } from './BannerUncheckedCreateWithoutCategoryInputSchema';

export const BannerCreateOrConnectWithoutCategoryInputSchema: z.ZodType<Prisma.BannerCreateOrConnectWithoutCategoryInput> = z.strictObject({
  where: z.lazy(() => BannerWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BannerCreateWithoutCategoryInputSchema), z.lazy(() => BannerUncheckedCreateWithoutCategoryInputSchema) ]),
});

export default BannerCreateOrConnectWithoutCategoryInputSchema;
