import { LocaleEnum } from '@event-space/shared';
import z from 'zod';

export const CategoryFormTranslationSchema = z.object({
    locale: LocaleEnum,
    name: z.string().min(1, 'Name is required'),
});

export type CategoryFormTranslationValues = z.infer<typeof CategoryFormTranslationSchema>;

export const CategoryFormSchema = z.object({
    slug: z.string().min(1, 'Slug is required'),
    translations: z.array(CategoryFormTranslationSchema).min(1, 'At least one translation is required'),
});

export type CategoryFormValues = z.infer<typeof CategoryFormSchema>;
