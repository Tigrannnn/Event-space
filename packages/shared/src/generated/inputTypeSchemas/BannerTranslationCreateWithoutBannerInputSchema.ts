import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';

export const BannerTranslationCreateWithoutBannerInputSchema: z.ZodType<Prisma.BannerTranslationCreateWithoutBannerInput> = z.strictObject({
  id: z.uuid().optional(),
  locale: z.lazy(() => LocaleSchema),
  title: z.string(),
  subtitle: z.string().optional().nullable(),
});

export default BannerTranslationCreateWithoutBannerInputSchema;
