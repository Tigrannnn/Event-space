import { headers } from 'next/headers';
import { EnvKey } from '@event-space/shared';
import { clientEnv } from '@/config/env';

/**
 * Absolute origin of the public site.
 *
 * Search engines read robots.txt, sitemap.xml and hreflang tags outside any page context, so those
 * are the places that cannot use relative URLs and need this.
 */
export function getSiteUrl(): string {
	return (clientEnv[EnvKey.FRONTEND_URL] ?? 'http://localhost:3000').replace(/\/+$/, '');
}

/**
 * Origin the current request actually arrived on, which is not always the one above.
 *
 * Each company's demo lives on its own subdomain and is its own site: its name, colors and logo
 * come from the Host header. Canonical links, hreflang and og:image built from the environment's
 * single FRONTEND_URL pointed all of them back at the main domain instead — so a link to a
 * company's site, pasted into a messenger, was previewed as the main site: the wrong name and
 * the wrong logo. Falls back to the environment when there is no Host header to read.
 */
export async function getRequestSiteUrl(): Promise<string> {
	const requestHeaders = await headers();
	const host = requestHeaders.get('host');
	if (!host) return getSiteUrl();

	const protocol = requestHeaders.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
	return `${protocol}://${host}`;
}
