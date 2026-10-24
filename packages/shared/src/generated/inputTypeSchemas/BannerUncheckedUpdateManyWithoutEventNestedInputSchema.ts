import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerCreateWithoutEventInputSchema } from './BannerCreateWithoutEventInputSchema';
import { BannerUncheckedCreateWithoutEventInputSchema } from './BannerUncheckedCreateWithoutEventInputSchema';
import { BannerCreateOrConnectWithoutEventInputSchema } from './BannerCreateOrConnectWithoutEventInputSchema';
import { BannerUpsertWithWhereUniqueWithoutEventInputSchema } from './BannerUpsertWithWhereUniqueWithoutEventInputSchema';
import { BannerCreateManyEventInputEnvelopeSchema } from './BannerCreateManyEventInputEnvelopeSchema';
import { BannerWhereUniqueInputSchema } from './BannerWhereUniqueInputSchema';
import { BannerUpdateWithWhereUniqueWithoutEventInputSchema } from './BannerUpdateWithWhereUniqueWithoutEventInputSchema';
import { BannerUpdateManyWithWhereWithoutEventInputSchema } from './BannerUpdateManyWithWhereWithoutEventInputSchema';
import { BannerScalarWhereInputSchema } from './BannerScalarWhereInputSchema';

export const BannerUncheckedUpdateManyWithoutEventNestedInputSchema: z.ZodType<Prisma.BannerUncheckedUpdateManyWithoutEventNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => BannerCreateWithoutEventInputSchema), z.lazy(() => BannerCreateWithoutEventInputSchema).array(), z.lazy(() => BannerUncheckedCreateWithoutEventInputSchema), z.lazy(() => BannerUncheckedCreateWithoutEventInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BannerCreateOrConnectWithoutEventInputSchema), z.lazy(() => BannerCreateOrConnectWithoutEventInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BannerUpsertWithWhereUniqueWithoutEventInputSchema), z.lazy(() => BannerUpsertWithWhereUniqueWithoutEventInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BannerCreateManyEventInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BannerWhereUniqueInputSchema), z.lazy(() => BannerWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BannerWhereUniqueInputSchema), z.lazy(() => BannerWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BannerWhereUniqueInputSchema), z.lazy(() => BannerWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BannerWhereUniqueInputSchema), z.lazy(() => BannerWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BannerUpdateWithWhereUniqueWithoutEventInputSchema), z.lazy(() => BannerUpdateWithWhereUniqueWithoutEventInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BannerUpdateManyWithWhereWithoutEventInputSchema), z.lazy(() => BannerUpdateManyWithWhereWithoutEventInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BannerScalarWhereInputSchema), z.lazy(() => BannerScalarWhereInputSchema).array() ]).optional(),
});

export default BannerUncheckedUpdateManyWithoutEventNestedInputSchema;
