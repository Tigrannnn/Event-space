import { z } from './openapi';
import { CategorySchema as GeneratedCategorySchema } from '../generated/modelSchema/CategorySchema';
import { CategoryTranslationSchema as GeneratedCategoryTranslationSchema } from '../generated/modelSchema/CategoryTranslationSchema';;

export const CategoryTranslationSchema = GeneratedCategoryTranslationSchema;
export type CategoryTranslation = z.infer<typeof CategoryTranslationSchema>;

export const CategorySchema = GeneratedCategorySchema.extend({
    translations: z.array(CategoryTranslationSchema).default([]),
});

export type Category = z.infer<typeof CategorySchema>;

// Schema for creating a category
export const CreateCategoryTranslationSchema = CategoryTranslationSchema.omit({
    id: true,
    categoryId: true,
});

export type CreateCategoryTranslation = z.infer<typeof CreateCategoryTranslationSchema>;

export const CreateCategorySchema = CategorySchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    translations: true,
}).extend({
    translations: z.array(CreateCategoryTranslationSchema).min(1, 'At least one translation is required'),
});

export type CreateCategoryData = z.infer<typeof CreateCategorySchema>;

// Schema for updating a category
export const UpdateCategoryTranslationSchema = CreateCategoryTranslationSchema;
export type UpdateCategoryTranslation = z.infer<typeof UpdateCategoryTranslationSchema>;

export const UpdateCategorySchema = CreateCategorySchema.partial();
export type UpdateCategoryData = z.infer<typeof UpdateCategorySchema>;
