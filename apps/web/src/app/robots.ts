import type { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n/config';
import { getSiteUrl } from '@/lib/site-url';

/** Sections that only exist for a signed-in user — nothing there is worth a crawl budget. */
const PRIVATE_PATHS = ['/admin', '/profile', '/bookings', '/favorites'];

/**
 * Served at /robots.txt.
 *
 * The private sections are listed once per locale rather than matched with a wildcard: every URL
 * on this site carries its locale, so a bare /admin never exists, and wildcard support in
 * robots.txt is a search-engine extension rather than something every crawler honours.
 *
 * Disallow is not a security measure — those routes are behind a guard. It keeps crawlers off
 * pages that redirect to a login and would otherwise burn crawl budget and surface as soft 404s.
 */
export default function robots(): MetadataRoute.Robots {
	const siteUrl = getSiteUrl();

	return {
		rules: {
			userAgent: '*',
			allow: '/',
			disallow: locales.flatMap((locale) => PRIVATE_PATHS.map((path) => `/${locale}${path}`)),
		},
		sitemap: `${siteUrl}/sitemap.xml`,
	};
}
