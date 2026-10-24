import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerWhereUniqueInputSchema } from './BannerWhereUniqueInputSchema';
import { BannerCreateWithoutEventInputSchema } from './BannerCreateWithoutEventInputSchema';
import { BannerUncheckedCreateWithoutEventInputSchema } from './BannerUncheckedCreateWithoutEventInputSchema';

export const BannerCreateOrConnectWithoutEventInputSchema: z.ZodType<Prisma.BannerCreateOrConnectWithoutEventInput> = z.strictObject({
  where: z.lazy(() => BannerWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BannerCreateWithoutEventInputSchema), z.lazy(() => BannerUncheckedCreateWithoutEventInputSchema) ]),
});

export default BannerCreateOrConnectWithoutEventInputSchema;
