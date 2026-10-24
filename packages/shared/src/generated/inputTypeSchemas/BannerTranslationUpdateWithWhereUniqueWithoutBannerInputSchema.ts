import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerTranslationWhereUniqueInputSchema } from './BannerTranslationWhereUniqueInputSchema';
import { BannerTranslationUpdateWithoutBannerInputSchema } from './BannerTranslationUpdateWithoutBannerInputSchema';
import { BannerTranslationUncheckedUpdateWithoutBannerInputSchema } from './BannerTranslationUncheckedUpdateWithoutBannerInputSchema';

export const BannerTranslationUpdateWithWhereUniqueWithoutBannerInputSchema: z.ZodType<Prisma.BannerTranslationUpdateWithWhereUniqueWithoutBannerInput> = z.strictObject({
  where: z.lazy(() => BannerTranslationWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => BannerTranslationUpdateWithoutBannerInputSchema), z.lazy(() => BannerTranslationUncheckedUpdateWithoutBannerInputSchema) ]),
});

export default BannerTranslationUpdateWithWhereUniqueWithoutBannerInputSchema;
