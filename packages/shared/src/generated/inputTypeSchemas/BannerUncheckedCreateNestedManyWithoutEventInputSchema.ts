import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerCreateWithoutEventInputSchema } from './BannerCreateWithoutEventInputSchema';
import { BannerUncheckedCreateWithoutEventInputSchema } from './BannerUncheckedCreateWithoutEventInputSchema';
import { BannerCreateOrConnectWithoutEventInputSchema } from './BannerCreateOrConnectWithoutEventInputSchema';
import { BannerCreateManyEventInputEnvelopeSchema } from './BannerCreateManyEventInputEnvelopeSchema';
import { BannerWhereUniqueInputSchema } from './BannerWhereUniqueInputSchema';

export const BannerUncheckedCreateNestedManyWithoutEventInputSchema: z.ZodType<Prisma.BannerUncheckedCreateNestedManyWithoutEventInput> = z.strictObject({
  create: z.union([ z.lazy(() => BannerCreateWithoutEventInputSchema), z.lazy(() => BannerCreateWithoutEventInputSchema).array(), z.lazy(() => BannerUncheckedCreateWithoutEventInputSchema), z.lazy(() => BannerUncheckedCreateWithoutEventInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BannerCreateOrConnectWithoutEventInputSchema), z.lazy(() => BannerCreateOrConnectWithoutEventInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BannerCreateManyEventInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BannerWhereUniqueInputSchema), z.lazy(() => BannerWhereUniqueInputSchema).array() ]).optional(),
});

export default BannerUncheckedCreateNestedManyWithoutEventInputSchema;
