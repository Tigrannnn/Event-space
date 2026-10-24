import { z } from 'zod';
import { LocaleSchema } from '../inputTypeSchemas/LocaleSchema'

/////////////////////////////////////////
// BANNER TRANSLATION SCHEMA
/////////////////////////////////////////

export const BannerTranslationSchema = z.object({
  locale: LocaleSchema,
  id: z.uuid(),
  bannerId: z.string(),
  title: z.string(),
  subtitle: z.string().nullable(),
  ctaLabel: z.string().nullable(),
})

export type BannerTranslation = z.infer<typeof BannerTranslationSchema>

export default BannerTranslationSchema;
