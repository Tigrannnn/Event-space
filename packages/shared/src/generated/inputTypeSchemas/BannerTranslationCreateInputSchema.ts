import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';
import { BannerCreateNestedOneWithoutTranslationsInputSchema } from './BannerCreateNestedOneWithoutTranslationsInputSchema';

export const BannerTranslationCreateInputSchema: z.ZodType<Prisma.BannerTranslationCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  locale: z.lazy(() => LocaleSchema),
  title: z.string(),
  subtitle: z.string().optional().nullable(),
  ctaLabel: z.string().optional().nullable(),
  banner: z.lazy(() => BannerCreateNestedOneWithoutTranslationsInputSchema),
});

export default BannerTranslationCreateInputSchema;
