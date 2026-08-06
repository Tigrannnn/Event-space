import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { defaultLocale, isLocale, locales, type Locale } from '@/lib/i18n/config';
import { getSiteUrl } from '@/lib/site-url';

/** Absolute URL of a page in one language. `path` is locale-less and starts with a slash, or is ''. */
export function localeUrl(locale: Locale, path = ''): string {
	return `${getSiteUrl()}/${locale}${path}`;
}

/** The locale the middleware resolved for this request, as it put it on the x-locale header. */
export async function getRequestLocale(): Promise<Locale> {
	const header = (await headers()).get('x-locale');
	return header && isLocale(header) ? header : defaultLocale;
}

/**
 * The canonical URL of a page plus its translations, for the page's <head>.
 *
 * The same content lives at three URLs here, one per language, and nothing about them says so.
 * Left alone, a search engine treats them as three pages competing for the same query, splits
 * their standing between them and picks one at random to show. `languages` is the statement that
 * they are one page in three languages, so a Russian reader gets sent to /ru and an Armenian one
 * to /hy.
 *
 * `x-default` covers everyone whose language is none of the three.
 *
 * `canonical` names the page's own address. It matters here because filters and tracking
 * parameters produce endless URL variants of the same page — without it, each one can be indexed
 * separately.
 */
export function localeAlternates(locale: Locale, path = ''): Metadata['alternates'] {
	return {
		canonical: localeUrl(locale, path),
		languages: {
			...Object.fromEntries(locales.map((target) => [target, localeUrl(target, path)])),
			'x-default': localeUrl(defaultLocale, path),
		},
	};
}

/**
 * Keeps a page out of search results.
 *
 * robots.txt already asks crawlers not to walk these, but a disallowed URL can still be indexed
 * from a link elsewhere — the crawler simply never sees the page it lists. This is the tag that
 * actually says "do not show this", and it is read only when the page is fetched, which is why
 * both exist.
 */
export const PRIVATE_PAGE_ROBOTS: Metadata['robots'] = { index: false, follow: false };
