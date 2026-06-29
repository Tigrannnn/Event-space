import { Category } from '@event-space/shared';
import type { CategoryFormValues } from './category-form.schema';

export const mapCategoryToFormValues = (category?: Category): CategoryFormValues => {
    return {
        slug: category?.slug ?? '',
        translations: category?.translations ?? [],
    };
};

export const mapFormValuesToCreateCategoryData = (values: CategoryFormValues) => {
    return values;
};

export const mapFormValuesToUpdateCategoryData = (values: CategoryFormValues) => {
    return values;
};
