import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';

export const BannerTranslationUncheckedCreateWithoutBannerInputSchema: z.ZodType<Prisma.BannerTranslationUncheckedCreateWithoutBannerInput> = z.strictObject({
  id: z.uuid().optional(),
  locale: z.lazy(() => LocaleSchema),
  title: z.string(),
  subtitle: z.string().optional().nullable(),
  ctaLabel: z.string().optional().nullable(),
});

export default BannerTranslationUncheckedCreateWithoutBannerInputSchema;
