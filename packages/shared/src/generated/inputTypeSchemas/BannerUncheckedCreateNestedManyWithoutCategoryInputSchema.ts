import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerCreateWithoutCategoryInputSchema } from './BannerCreateWithoutCategoryInputSchema';
import { BannerUncheckedCreateWithoutCategoryInputSchema } from './BannerUncheckedCreateWithoutCategoryInputSchema';
import { BannerCreateOrConnectWithoutCategoryInputSchema } from './BannerCreateOrConnectWithoutCategoryInputSchema';
import { BannerCreateManyCategoryInputEnvelopeSchema } from './BannerCreateManyCategoryInputEnvelopeSchema';
import { BannerWhereUniqueInputSchema } from './BannerWhereUniqueInputSchema';

export const BannerUncheckedCreateNestedManyWithoutCategoryInputSchema: z.ZodType<Prisma.BannerUncheckedCreateNestedManyWithoutCategoryInput> = z.strictObject({
  create: z.union([ z.lazy(() => BannerCreateWithoutCategoryInputSchema), z.lazy(() => BannerCreateWithoutCategoryInputSchema).array(), z.lazy(() => BannerUncheckedCreateWithoutCategoryInputSchema), z.lazy(() => BannerUncheckedCreateWithoutCategoryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BannerCreateOrConnectWithoutCategoryInputSchema), z.lazy(() => BannerCreateOrConnectWithoutCategoryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BannerCreateManyCategoryInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BannerWhereUniqueInputSchema), z.lazy(() => BannerWhereUniqueInputSchema).array() ]).optional(),
});

export default BannerUncheckedCreateNestedManyWithoutCategoryInputSchema;
