'use client';

import { usePathname, useRouter, useParams } from 'next/navigation';
import { localizePath, type Locale, defaultLocale } from './config';

export function useLocalizedNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const locale = (params.locale as Locale) || defaultLocale;

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
        },
    };
}