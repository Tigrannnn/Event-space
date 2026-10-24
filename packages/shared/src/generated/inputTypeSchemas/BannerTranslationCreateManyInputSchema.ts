import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';

export const BannerTranslationCreateManyInputSchema: z.ZodType<Prisma.BannerTranslationCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  bannerId: z.string(),
  locale: z.lazy(() => LocaleSchema),
  title: z.string(),
  subtitle: z.string().optional().nullable(),
  ctaLabel: z.string().optional().nullable(),
});

export default BannerTranslationCreateManyInputSchema;
