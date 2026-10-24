import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerWhereUniqueInputSchema } from './BannerWhereUniqueInputSchema';
import { BannerUpdateWithoutEventInputSchema } from './BannerUpdateWithoutEventInputSchema';
import { BannerUncheckedUpdateWithoutEventInputSchema } from './BannerUncheckedUpdateWithoutEventInputSchema';
import { BannerCreateWithoutEventInputSchema } from './BannerCreateWithoutEventInputSchema';
import { BannerUncheckedCreateWithoutEventInputSchema } from './BannerUncheckedCreateWithoutEventInputSchema';

export const BannerUpsertWithWhereUniqueWithoutEventInputSchema: z.ZodType<Prisma.BannerUpsertWithWhereUniqueWithoutEventInput> = z.strictObject({
  where: z.lazy(() => BannerWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => BannerUpdateWithoutEventInputSchema), z.lazy(() => BannerUncheckedUpdateWithoutEventInputSchema) ]),
  create: z.union([ z.lazy(() => BannerCreateWithoutEventInputSchema), z.lazy(() => BannerUncheckedCreateWithoutEventInputSchema) ]),
});

export default BannerUpsertWithWhereUniqueWithoutEventInputSchema;
