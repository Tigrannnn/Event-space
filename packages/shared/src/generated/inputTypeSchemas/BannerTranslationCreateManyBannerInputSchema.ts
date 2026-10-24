import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';

export const BannerTranslationCreateManyBannerInputSchema: z.ZodType<Prisma.BannerTranslationCreateManyBannerInput> = z.strictObject({
  id: z.uuid().optional(),
  locale: z.lazy(() => LocaleSchema),
  title: z.string(),
  subtitle: z.string().optional().nullable(),
});

export default BannerTranslationCreateManyBannerInputSchema;
