import { z } from 'zod';
import { LocaleSchema } from '../inputTypeSchemas/LocaleSchema'

/////////////////////////////////////////
// CATEGORY TRANSLATION SCHEMA
/////////////////////////////////////////

export const CategoryTranslationSchema = z.object({
  locale: LocaleSchema,
  id: z.uuid(),
  categoryId: z.string(),
  name: z.string(),
  /**
   * Текст на странице категории: без него странице нечем ранжироваться в поиске.
   */
  description: z.string().nullable(),
})

export type CategoryTranslation = z.infer<typeof CategoryTranslationSchema>

export default CategoryTranslationSchema;
