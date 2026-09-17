import { LocaleEnum } from '@event-space/shared';
import z from 'zod';

export const CategoryFormTranslationSchema = z.object({
    locale: LocaleEnum,
    name: z.string().min(1, 'admin.validation.nameRequired'),
});

export type CategoryFormTranslationValues = z.infer<typeof CategoryFormTranslationSchema>;

export const CategoryFormSchema = z.object({
    slug: z.string().min(1, 'admin.validation.slugRequired'),
    translations: z.array(CategoryFormTranslationSchema).min(1, 'admin.validation.translationRequired'),
});

export type CategoryFormValues = z.infer<typeof CategoryFormSchema>;
