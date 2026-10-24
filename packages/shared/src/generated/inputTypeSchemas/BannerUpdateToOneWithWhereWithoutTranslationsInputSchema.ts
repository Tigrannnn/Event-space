import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerWhereInputSchema } from './BannerWhereInputSchema';
import { BannerUpdateWithoutTranslationsInputSchema } from './BannerUpdateWithoutTranslationsInputSchema';
import { BannerUncheckedUpdateWithoutTranslationsInputSchema } from './BannerUncheckedUpdateWithoutTranslationsInputSchema';

export const BannerUpdateToOneWithWhereWithoutTranslationsInputSchema: z.ZodType<Prisma.BannerUpdateToOneWithWhereWithoutTranslationsInput> = z.strictObject({
  where: z.lazy(() => BannerWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => BannerUpdateWithoutTranslationsInputSchema), z.lazy(() => BannerUncheckedUpdateWithoutTranslationsInputSchema) ]),
});

export default BannerUpdateToOneWithWhereWithoutTranslationsInputSchema;
