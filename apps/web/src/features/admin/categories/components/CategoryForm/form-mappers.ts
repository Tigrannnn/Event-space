import { Category } from '@event-space/shared';
import type { CategoryFormValues } from './category-form.schema';

export const mapCategoryToFormValues = (category?: Category): CategoryFormValues => {
    return {
        slug: category?.slug ?? '',
        translations: (category?.translations ?? []).map((translation) => ({
            locale: translation.locale,
            name: translation.name,
            description: translation.description ?? '',
        })),
    };
};

const trimTranslations = (values: CategoryFormValues) => ({
    ...values,
    translations: values.translations.map((translation) => ({
        ...translation,
        description: translation.description?.trim() || null,
    })),
});

export const mapFormValuesToCreateCategoryData = (values: CategoryFormValues) => trimTranslations(values);

export const mapFormValuesToUpdateCategoryData = (values: CategoryFormValues) => trimTranslations(values);
