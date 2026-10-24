import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';

export const BannerTranslationBannerIdLocaleCompoundUniqueInputSchema: z.ZodType<Prisma.BannerTranslationBannerIdLocaleCompoundUniqueInput> = z.strictObject({
  bannerId: z.string(),
  locale: z.lazy(() => LocaleSchema),
});

export default BannerTranslationBannerIdLocaleCompoundUniqueInputSchema;
