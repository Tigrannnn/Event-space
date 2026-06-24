import { Locale } from "@event-space/shared";

export const locales = ['hy', 'ru', 'en'] as const

export const defaultLocale: Locale = 'en';

export type { Locale } from "@event-space/shared";

export const localeLabels: Record<Locale, string> = {
	hy: 'Հայ',
	ru: 'Рус',
	en: 'Eng',
};

export const localeNames: Record<Locale, string> = {
	hy: 'Հայերեն',
	ru: 'Русский',
	en: 'English',
};

export const localeOpenGraph: Record<Locale, string> = {
	hy: 'hy_AM',
	ru: 'ru_RU',
	en: 'en_US',
};

export const localeIntl: Record<Locale, string> = {
	hy: 'hy-AM',
	ru: 'ru-RU',
	en: 'en-US',
};

export function isLocale(value: string): value is Locale {
	return locales.includes(value as Locale);
}

export function getLocaleFromPathname(pathname: string): Locale | null {
	const segment = pathname.split('/')[1];
	return segment && isLocale(segment) ? segment : null;
}

export function stripLocaleFromPathname(pathname: string): string {
	const locale = getLocaleFromPathname(pathname);
	if (!locale) return pathname || '/';

	const stripped = pathname.slice(locale.length + 1);
	return stripped.startsWith('/') ? stripped || '/' : `/${stripped}`;
}

export function localizePath(pathname: string, locale: Locale): string {
	const cleanPath = stripLocaleFromPathname(pathname);
	return cleanPath === '/' ? `/${locale}` : `/${locale}${cleanPath}`;
}

export function getPreferredLocale(acceptLanguage?: string | null): Locale {
	if (!acceptLanguage) return defaultLocale;

	const requestedLocales = acceptLanguage
		.split(',')
		.map((part) => part.split(';')[0]?.trim().toLowerCase())
		.filter(Boolean);

	for (const requested of requestedLocales) {
		const baseLocale = requested.split('-')[0];
		if (baseLocale && isLocale(baseLocale)) {
			return baseLocale;
		}
	}

	return defaultLocale;
}
