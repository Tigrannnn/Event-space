import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerCreateWithoutCategoryInputSchema } from './BannerCreateWithoutCategoryInputSchema';
import { BannerUncheckedCreateWithoutCategoryInputSchema } from './BannerUncheckedCreateWithoutCategoryInputSchema';
import { BannerCreateOrConnectWithoutCategoryInputSchema } from './BannerCreateOrConnectWithoutCategoryInputSchema';
import { BannerUpsertWithWhereUniqueWithoutCategoryInputSchema } from './BannerUpsertWithWhereUniqueWithoutCategoryInputSchema';
import { BannerCreateManyCategoryInputEnvelopeSchema } from './BannerCreateManyCategoryInputEnvelopeSchema';
import { BannerWhereUniqueInputSchema } from './BannerWhereUniqueInputSchema';
import { BannerUpdateWithWhereUniqueWithoutCategoryInputSchema } from './BannerUpdateWithWhereUniqueWithoutCategoryInputSchema';
import { BannerUpdateManyWithWhereWithoutCategoryInputSchema } from './BannerUpdateManyWithWhereWithoutCategoryInputSchema';
import { BannerScalarWhereInputSchema } from './BannerScalarWhereInputSchema';

export const BannerUpdateManyWithoutCategoryNestedInputSchema: z.ZodType<Prisma.BannerUpdateManyWithoutCategoryNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => BannerCreateWithoutCategoryInputSchema), z.lazy(() => BannerCreateWithoutCategoryInputSchema).array(), z.lazy(() => BannerUncheckedCreateWithoutCategoryInputSchema), z.lazy(() => BannerUncheckedCreateWithoutCategoryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BannerCreateOrConnectWithoutCategoryInputSchema), z.lazy(() => BannerCreateOrConnectWithoutCategoryInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BannerUpsertWithWhereUniqueWithoutCategoryInputSchema), z.lazy(() => BannerUpsertWithWhereUniqueWithoutCategoryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BannerCreateManyCategoryInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BannerWhereUniqueInputSchema), z.lazy(() => BannerWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BannerWhereUniqueInputSchema), z.lazy(() => BannerWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BannerWhereUniqueInputSchema), z.lazy(() => BannerWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BannerWhereUniqueInputSchema), z.lazy(() => BannerWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BannerUpdateWithWhereUniqueWithoutCategoryInputSchema), z.lazy(() => BannerUpdateWithWhereUniqueWithoutCategoryInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BannerUpdateManyWithWhereWithoutCategoryInputSchema), z.lazy(() => BannerUpdateManyWithWhereWithoutCategoryInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BannerScalarWhereInputSchema), z.lazy(() => BannerScalarWhereInputSchema).array() ]).optional(),
});

export default BannerUpdateManyWithoutCategoryNestedInputSchema;
