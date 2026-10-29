import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getCategoryTranslation, type Category } from '@event-space/shared';
import EventsList from '../../(home)/_components/EventsList';
import { CATALOGUE_FETCH_LIMIT } from '../../(home)/_components/events-grid';
import {
	buildEventsApiUrl,
	parseFiltersFromSearchParams,
} from '../../(home)/_components/filters';
import type { PaginatedEventsResponse } from '@/features/events/api/events.api';
import { serverFetch } from '@/lib/server.api';
import { getRequestLocale, localeAlternates, snippetDescription } from '@/lib/seo';
import { getBrandForHost } from '@/config/brands';
import { translate } from '@/lib/i18n/messages';

interface CategoryPageProps {
	params: Promise<{ slug: string }>;
	searchParams: Promise<Record<string, string | undefined>>;
}

async function findCategory(slug: string): Promise<Category | null> {
	const categories = await serverFetch<Category[]>('/categories').catch(() => null);

	return categories?.find((category) => category.slug === slug) ?? null;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
	const { slug } = await params;
	const locale = await getRequestLocale();
	const brand = getBrandForHost((await headers()).get('host'));
	const category = await findCategory(slug);

	if (!category) {
		return { title: `${translate(locale, 'common.notFoundTitle')} | ${brand.name}` };
	}

	const translation = getCategoryTranslation(category, locale);
	const title = `${translation.name} | ${brand.name}`;
	const description = snippetDescription(
		translation.description,
		translate(locale, 'common.appDescription'),
	);

	return {
		title,
		description,
		alternates: await localeAlternates(locale, `/category/${slug}`),
		openGraph: {
			title,
			description,
			siteName: brand.name,
			images: [{ url: brand.ogImage, alt: `${brand.name} Logo` }],
			type: 'website',
		},
	};
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
	const { slug } = await params;
	const category = await findCategory(slug);

	if (!category) {
		notFound();
	}

	const locale = await getRequestLocale();
	const translation = getCategoryTranslation(category, locale);

	const query = await searchParams;
	const searchQuery = query.search ?? '';

	const urlSearchParams = new URLSearchParams();
	Object.entries(query).forEach(([key, value]) => {
		if (value) urlSearchParams.set(key, value);
	});

	const filters = parseFiltersFromSearchParams(urlSearchParams);
	const url = buildEventsApiUrl(
		{ ...filters, categories: [slug] },
		searchQuery,
		CATALOGUE_FETCH_LIMIT,
	);

	const initialData = await serverFetch<PaginatedEventsResponse>(url).catch(() => ({
		data: [],
		nextCursor: null,
		hasMore: false,
	}));

	return (
		<div className="min-h-full px-4 sm:px-6 lg:px-8">
			<div className="sr-only">
				<h1>{translation.name}</h1>
				{translation.description && <p>{translation.description}</p>}
			</div>

			<EventsList
				initialEvents={initialData.data}
				initialNextCursor={initialData.nextCursor}
				initialHasMore={initialData.hasMore}
				searchQuery={searchQuery}
				categorySlug={slug}
			/>
		</div>
	);
}
