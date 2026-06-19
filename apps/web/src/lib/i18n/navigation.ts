'use client';

import { usePathname, useRouter } from 'next/navigation';
import { localizePath, type Locale } from './config';
import { useI18nStore } from '@/stores/i18n';

export function useLocalizedNavigation() {
	const router = useRouter();
	const pathname = usePathname();
	const { locale, setLocale } = useI18nStore();

	return {
		locale,
		pathname,
		push: (path: string, options?: { scroll?: boolean }) => {
			router.push(localizePath(path, locale), options);
		},
		replace: (path: string, options?: { scroll?: boolean }) => {
			router.replace(localizePath(path, locale), options);
		},
		switchLocale: (nextLocale: Locale) => {
			router.push(localizePath(pathname, nextLocale));
			setLocale(nextLocale);
		},
	};
}
