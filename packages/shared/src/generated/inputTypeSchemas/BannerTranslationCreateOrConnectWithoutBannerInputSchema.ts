import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerTranslationWhereUniqueInputSchema } from './BannerTranslationWhereUniqueInputSchema';
import { BannerTranslationCreateWithoutBannerInputSchema } from './BannerTranslationCreateWithoutBannerInputSchema';
import { BannerTranslationUncheckedCreateWithoutBannerInputSchema } from './BannerTranslationUncheckedCreateWithoutBannerInputSchema';

export const BannerTranslationCreateOrConnectWithoutBannerInputSchema: z.ZodType<Prisma.BannerTranslationCreateOrConnectWithoutBannerInput> = z.strictObject({
  where: z.lazy(() => BannerTranslationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BannerTranslationCreateWithoutBannerInputSchema), z.lazy(() => BannerTranslationUncheckedCreateWithoutBannerInputSchema) ]),
});

export default BannerTranslationCreateOrConnectWithoutBannerInputSchema;
