import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerWhereUniqueInputSchema } from './BannerWhereUniqueInputSchema';
import { BannerUpdateWithoutEventInputSchema } from './BannerUpdateWithoutEventInputSchema';
import { BannerUncheckedUpdateWithoutEventInputSchema } from './BannerUncheckedUpdateWithoutEventInputSchema';

export const BannerUpdateWithWhereUniqueWithoutEventInputSchema: z.ZodType<Prisma.BannerUpdateWithWhereUniqueWithoutEventInput> = z.strictObject({
  where: z.lazy(() => BannerWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => BannerUpdateWithoutEventInputSchema), z.lazy(() => BannerUncheckedUpdateWithoutEventInputSchema) ]),
});

export default BannerUpdateWithWhereUniqueWithoutEventInputSchema;
