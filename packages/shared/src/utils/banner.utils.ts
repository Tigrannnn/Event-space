import type { Banner, BannerTranslation } from '../schemas/banner.schema';
import type { Locale } from '../schemas/locale.schema';

const EMPTY_TRANSLATION = {
	id: '',
	bannerId: '',
	title: '',
	subtitle: null,
} as const;

export function getBannerTranslation(
	banner: Pick<Banner, 'translations'> | undefined,
	locale: Locale = 'en',
): BannerTranslation {
	const translations = banner?.translations ?? [];

	return (
		translations.find((translation) => translation.locale === locale) ??
		translations.find((translation) => translation.locale === 'en') ??
		translations[0] ?? { ...EMPTY_TRANSLATION, locale }
	);
}

/**
 * Where a slide sends the visitor. Internal targets are returned without a locale prefix:
 * the web app adds it the same way it does for every other link.
 */
export function getBannerHref(banner: Banner): string | null {
	switch (banner.targetType) {
		case 'EVENT':
			return banner.event ? `/events/${banner.event.id}` : null;
		case 'CATEGORY':
			return banner.category ? `/category/${banner.category.slug}` : null;
		case 'URL':
			return banner.url ?? null;
	}
}

export function isBannerTargetExternal(banner: Banner): boolean {
	return banner.targetType === 'URL';
}
