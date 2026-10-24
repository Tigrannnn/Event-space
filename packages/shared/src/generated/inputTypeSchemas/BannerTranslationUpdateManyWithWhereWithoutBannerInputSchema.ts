import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerTranslationScalarWhereInputSchema } from './BannerTranslationScalarWhereInputSchema';
import { BannerTranslationUpdateManyMutationInputSchema } from './BannerTranslationUpdateManyMutationInputSchema';
import { BannerTranslationUncheckedUpdateManyWithoutBannerInputSchema } from './BannerTranslationUncheckedUpdateManyWithoutBannerInputSchema';

export const BannerTranslationUpdateManyWithWhereWithoutBannerInputSchema: z.ZodType<Prisma.BannerTranslationUpdateManyWithWhereWithoutBannerInput> = z.strictObject({
  where: z.lazy(() => BannerTranslationScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BannerTranslationUpdateManyMutationInputSchema), z.lazy(() => BannerTranslationUncheckedUpdateManyWithoutBannerInputSchema) ]),
});

export default BannerTranslationUpdateManyWithWhereWithoutBannerInputSchema;
