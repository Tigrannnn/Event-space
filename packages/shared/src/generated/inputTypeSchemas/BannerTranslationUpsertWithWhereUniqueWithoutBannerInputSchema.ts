import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerTranslationWhereUniqueInputSchema } from './BannerTranslationWhereUniqueInputSchema';
import { BannerTranslationUpdateWithoutBannerInputSchema } from './BannerTranslationUpdateWithoutBannerInputSchema';
import { BannerTranslationUncheckedUpdateWithoutBannerInputSchema } from './BannerTranslationUncheckedUpdateWithoutBannerInputSchema';
import { BannerTranslationCreateWithoutBannerInputSchema } from './BannerTranslationCreateWithoutBannerInputSchema';
import { BannerTranslationUncheckedCreateWithoutBannerInputSchema } from './BannerTranslationUncheckedCreateWithoutBannerInputSchema';

export const BannerTranslationUpsertWithWhereUniqueWithoutBannerInputSchema: z.ZodType<Prisma.BannerTranslationUpsertWithWhereUniqueWithoutBannerInput> = z.strictObject({
  where: z.lazy(() => BannerTranslationWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => BannerTranslationUpdateWithoutBannerInputSchema), z.lazy(() => BannerTranslationUncheckedUpdateWithoutBannerInputSchema) ]),
  create: z.union([ z.lazy(() => BannerTranslationCreateWithoutBannerInputSchema), z.lazy(() => BannerTranslationUncheckedCreateWithoutBannerInputSchema) ]),
});

export default BannerTranslationUpsertWithWhereUniqueWithoutBannerInputSchema;
