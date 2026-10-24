import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerWhereUniqueInputSchema } from './BannerWhereUniqueInputSchema';
import { BannerCreateWithoutTranslationsInputSchema } from './BannerCreateWithoutTranslationsInputSchema';
import { BannerUncheckedCreateWithoutTranslationsInputSchema } from './BannerUncheckedCreateWithoutTranslationsInputSchema';

export const BannerCreateOrConnectWithoutTranslationsInputSchema: z.ZodType<Prisma.BannerCreateOrConnectWithoutTranslationsInput> = z.strictObject({
  where: z.lazy(() => BannerWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BannerCreateWithoutTranslationsInputSchema), z.lazy(() => BannerUncheckedCreateWithoutTranslationsInputSchema) ]),
});

export default BannerCreateOrConnectWithoutTranslationsInputSchema;
