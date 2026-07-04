import { Category, CategoryTranslation } from '../schemas/category.schema';
import { Locale } from '../schemas/locale.schema';

export function getCategoryTranslation(
	category: Partial<Category> | undefined,
	locale: Locale = 'en',
): CategoryTranslation {
	const translations = category?.translations || [];
	if (translations.length === 0) {
		return {
			id: '',
			categoryId: '',
			locale: locale,
			name: '',
		};
	}
	let translation = translations.find((t) => t.locale === locale);
	if (!translation) {
		translation = translations.find((t) => t.locale === 'en');
	}
	if (!translation) {
		translation = translations[0];
	}
	return translation as CategoryTranslation;
}
