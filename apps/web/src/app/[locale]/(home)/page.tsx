import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getBrandForHost } from '@/config/brands';
import { translate } from '@/lib/i18n/messages';
import EventsList from './_components/EventsList';
import { getRequestLocale, localeAlternates, requestLocaleUrl } from '@/lib/seo';
import { buildWebSiteJsonLd, serializeJsonLd } from '@/lib/structured-data';
import { serverFetch } from '@/lib/server.api';
import { PaginatedEventsResponse } from '@/features/events/api/events.api';
import { BannerCarousel } from '@/features/banners';
import type { Banner } from '@event-space/shared';
import { parseFiltersFromSearchParams } from './_components/filters/filter-utils';
import { buildEventsApiUrl } from './_components/filters/catalogue-url';

/**
 * Only alternates — title, description and the rest stay inherited from the locale layout.
 *
 * The canonical is deliberately the bare URL: this page carries the catalogue filters in its
 * query string, and every combination of them is the same page. Without it, each filtered variant
 * could be indexed as a page of its own.
 */
export async function generateMetadata(): Promise<Metadata> {
	const locale = await getRequestLocale();
	const brand = getBrandForHost((await headers()).get('host'));

	const title = `${brand.name} | ${translate(locale, 'common.homeTitle')}`;
	const description = translate(locale, 'common.homeDescription');

	return {
		title,
		description,
		alternates: await localeAlternates(locale),
		openGraph: {
			title,
			description,
			siteName: brand.name,
			images: [{ url: brand.ogImage, alt: `${brand.name} Logo` }],
			type: 'website',
		},
	};
}

interface HomePageProps {
	searchParams: Promise<{
		search?: string;
		startDate?: string;
		endDate?: string;
		category?: string;
		categories?: string;
		minPrice?: string;
		maxPrice?: string;
		guests?: string;
		difficulty?: string;
	}>;
}

export default async function Home({ searchParams }: HomePageProps) {
	const locale = await getRequestLocale();
	const brand = getBrandForHost((await headers()).get('host'));
	const siteJsonLd = buildWebSiteJsonLd(brand.name, await requestLocaleUrl(locale));
	const params = await searchParams;
	const searchQuery = params.search || '';

	const urlSearchParams = new URLSearchParams();
	Object.entries(params).forEach(([key, value]) => {
		if (value) urlSearchParams.set(key, value);
	});

	const filters = parseFiltersFromSearchParams(urlSearchParams);

	const url = buildEventsApiUrl(filters, searchQuery);

	// A promo banner belongs on the shop window, not over a list someone is filtering down:
	// once the visitor is searching, they know what they came for.
	const isBrowsing = urlSearchParams.size === 0;

	const [initialData, banners] = await Promise.all([
		serverFetch<PaginatedEventsResponse>(url).catch((error) => {
			console.error('Error fetching events:', error);
			return { data: [], nextCursor: null, hasMore: false };
		}),
		isBrowsing
			? serverFetch<Banner[]>('/banners').catch((error) => {
					console.error('Error fetching banners:', error);
					return [] as Banner[];
				})
			: Promise.resolve([] as Banner[]),
	]);

	return (
		<div className="min-h-full px-4 sm:px-6 lg:px-8">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: serializeJsonLd([siteJsonLd]) }}
			/>
			<h1 className="sr-only">{translate(locale, 'common.homeHeading')}</h1>

			{banners.length > 0 && <BannerCarousel banners={banners} />}

			<EventsList
				initialEvents={initialData.data}
				initialNextCursor={initialData.nextCursor}
				initialHasMore={initialData.hasMore}
				searchQuery={searchQuery}
			/>
		</div>
	);
}
