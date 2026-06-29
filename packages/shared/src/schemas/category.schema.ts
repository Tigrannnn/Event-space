import { z } from './openapi';
import { CategorySchema as GeneratedCategorySchema } from '../generated/modelSchema/CategorySchema';
import { CategoryTranslationSchema as GeneratedCategoryTranslationSchema } from '../generated/modelSchema/CategoryTranslationSchema';

export const CategoryTranslationSchema = GeneratedCategoryTranslationSchema;
export type CategoryTranslation = z.infer<typeof CategoryTranslationSchema>;

export const CategorySchema = GeneratedCategorySchema.extend({
    translations: z.array(CategoryTranslationSchema).default([]),
});

export type Category = z.infer<typeof CategorySchema>;
