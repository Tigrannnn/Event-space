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
