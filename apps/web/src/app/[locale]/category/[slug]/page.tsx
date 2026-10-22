import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getCategoryTranslation, type Category } from '@event-space/shared';
import EventsList from '../../(home)/_components/EventsList';
import {
	buildEventsApiUrl,
	parseFiltersFromSearchParams,
} from '../../(home)/_components/filters';
import type { PaginatedEventsResponse } from '@/features/events/api/events.api';
import { serverFetch } from '@/lib/server.api';
import { getRequestLocale, localeAlternates } from '@/lib/seo';
import { getBrandForHost } from '@/config/brands';
import { translate } from '@/lib/i18n/messages';

const META_DESCRIPTION_LENGTH = 160;

interface CategoryPageProps {
	params: Promise<{ slug: string }>;
	searchParams: Promise<Record<string, string | undefined>>;
}

async function findCategory(slug: string): Promise<Category | null> {
	const categories = await serverFetch<Category[]>('/categories').catch(() => null);

	return categories?.find((category) => category.slug === slug) ?? null;
}

function metaDescription(description: string | null | undefined, fallback: string): string {
	const text = description?.trim();
	if (!text) return fallback;
	if (text.length <= META_DESCRIPTION_LENGTH) return text;

	const cut = text.slice(0, META_DESCRIPTION_LENGTH);
	const lastSpace = cut.lastIndexOf(' ');

	return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
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
	const description = metaDescription(
		translation.description,
		translate(locale, 'common.appDescription'),
	);

	return {
		title,
		description,
		alternates: await localeAlternates(locale, `/category/${slug}`),
		openGraph: { title, description, type: 'website' },
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
	const url = buildEventsApiUrl({ ...filters, categories: [slug] }, searchQuery);

	const initialData = await serverFetch<PaginatedEventsResponse>(url).catch(() => ({
		data: [],
		nextCursor: null,
		hasMore: false,
	}));

	return (
		<div className="min-h-full px-4 sm:px-6 lg:px-8">
			<div className="pt-6">
				<h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
					{translation.name}
				</h1>
				{translation.description && (
					<p className="mt-2 max-w-3xl text-sm whitespace-pre-line text-gray-600 sm:text-base dark:text-gray-300">
						{translation.description}
					</p>
				)}
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
