import type { MetadataRoute } from 'next';
import { EnvKey } from '@event-space/shared';
import { defaultLocale, locales } from '@/lib/i18n/config';
import { localeUrl } from '@/lib/seo';

/**
 * Public pages that live at a fixed path.
 *
 * The catalogue is the home page — there is no /events index, only /events/{id} — so this list is
 * as short as it looks.
 */
const STATIC_PAGES = [
	{ path: '', changeFrequency: 'daily', priority: 1 },
	{ path: '/about', changeFrequency: 'monthly', priority: 0.5 },
] as const satisfies readonly {
	path: string;
	changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
	priority: number;
}[];

const API_URL = process.env[EnvKey.API_URL] ?? 'http://localhost:5000';
const PAGE_SIZE = 100;
/** A stop so a paging bug cannot turn one crawl into an endless walk of the events API. */
const MAX_PAGES = 20;

/**
 * Rendered per request rather than at build time: the site's own origin comes from the
 * environment, and a prerendered sitemap freezes whatever was set during `docker build` —
 * which is nothing, so every URL came out as the localhost fallback.
 */
export const dynamic = 'force-dynamic';

type EventSummary = { id: string; updatedAt?: string };

/**
 * Served at /sitemap.xml.
 *
 * Every page is listed once per locale, and each entry carries the other two as alternates. That
 * is what tells a search engine the three URLs are one page in three languages rather than
 * duplicates competing with each other — the single most valuable thing a sitemap can do for a
 * site that has no un-prefixed canonical URL, which this one does not: `/` redirects to `/{locale}`.
 *
 * `x-default` points at the default locale, which is where a visitor with no language preference
 * would land anyway.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const events = await fetchPublishedEvents();

	const staticEntries = STATIC_PAGES.flatMap((page) =>
		entriesForPath(page.path, {
			changeFrequency: page.changeFrequency,
			priority: page.priority,
		}),
	);

	const eventEntries = events.flatMap((event) =>
		entriesForPath(`/events/${event.id}`, {
			changeFrequency: 'weekly',
			priority: 0.8,
			lastModified: event.updatedAt ? new Date(event.updatedAt) : undefined,
		}),
	);

	return [...staticEntries, ...eventEntries];
}

function entriesForPath(
	path: string,
	options: {
		changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
		priority: number;
		lastModified?: Date;
	},
): MetadataRoute.Sitemap {
	const languages = {
		...Object.fromEntries(locales.map((locale) => [locale, localeUrl(locale, path)])),
		'x-default': localeUrl(defaultLocale, path),
	};

	return locales.map((locale) => ({
		url: localeUrl(locale, path),
		lastModified: options.lastModified,
		changeFrequency: options.changeFrequency,
		priority: options.priority,
		alternates: { languages },
	}));
}

/**
 * Walks the public events endpoint, which is anonymous here and therefore returns published events
 * only — exactly the set that should be indexable.
 *
 * A failure returns what has been collected so far instead of throwing: a sitemap listing the
 * static pages is worth serving, while a 500 tells the crawler to come back another day and leaves
 * it with nothing.
 */
async function fetchPublishedEvents(): Promise<EventSummary[]> {
	const events: EventSummary[] = [];
	let cursor: string | null = null;

	try {
		for (let page = 0; page < MAX_PAGES; page += 1) {
			const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
			if (cursor) query.set('cursor', cursor);

			const response = await fetch(`${API_URL}/events?${query.toString()}`, {
				headers: { 'Content-Type': 'application/json' },
			});
			if (!response.ok) break;

			const payload = (await response.json()) as {
				data?: EventSummary[];
				nextCursor?: string | null;
				hasMore?: boolean;
			};

			events.push(...(payload.data ?? []));

			if (!payload.hasMore || !payload.nextCursor) break;
			cursor = payload.nextCursor;
		}
	} catch {
		return events;
	}

	return events;
}
