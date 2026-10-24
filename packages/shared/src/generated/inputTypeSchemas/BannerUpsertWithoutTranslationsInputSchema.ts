import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerUpdateWithoutTranslationsInputSchema } from './BannerUpdateWithoutTranslationsInputSchema';
import { BannerUncheckedUpdateWithoutTranslationsInputSchema } from './BannerUncheckedUpdateWithoutTranslationsInputSchema';
import { BannerCreateWithoutTranslationsInputSchema } from './BannerCreateWithoutTranslationsInputSchema';
import { BannerUncheckedCreateWithoutTranslationsInputSchema } from './BannerUncheckedCreateWithoutTranslationsInputSchema';
import { BannerWhereInputSchema } from './BannerWhereInputSchema';

export const BannerUpsertWithoutTranslationsInputSchema: z.ZodType<Prisma.BannerUpsertWithoutTranslationsInput> = z.strictObject({
  update: z.union([ z.lazy(() => BannerUpdateWithoutTranslationsInputSchema), z.lazy(() => BannerUncheckedUpdateWithoutTranslationsInputSchema) ]),
  create: z.union([ z.lazy(() => BannerCreateWithoutTranslationsInputSchema), z.lazy(() => BannerUncheckedCreateWithoutTranslationsInputSchema) ]),
  where: z.lazy(() => BannerWhereInputSchema).optional(),
});

export default BannerUpsertWithoutTranslationsInputSchema;
