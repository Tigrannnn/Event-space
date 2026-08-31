import { serverFetch } from '@/lib/server.api';
import { getEventCoverImageUrl, getEventTranslation, Locale, Event } from '@event-space/shared';
import EventPageContent from './EventPageContent';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { defaultLocale, isLocale, localeOpenGraph } from '@/lib/i18n/config';
import { translate } from '@/lib/i18n/messages';
import { getRequestLocale, localeAlternates, localeUrl } from '@/lib/seo';
import { buildEventJsonLd, serializeJsonLd } from '@/lib/structured-data';
import { getBrandForHost } from '@/config/brands';

interface EventPageProps {
	params: Promise<{ id: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
	const { id } = await params;

	const event = await serverFetch<Event>(`/events/${id}`);

	if (!event) {
		notFound();
	}

	const locale = await getRequestLocale();
	const jsonLd = buildEventJsonLd(event, locale, localeUrl(locale, `/events/${event.id}`));

	return (
		<>
			{jsonLd.length > 0 && (
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
				/>
			)}
			<EventPageContent initialEvent={event} key={event.id} />
		</>
	);
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const requestHeaders = await headers();
	const localeHeader = requestHeaders.get('x-locale');
	const locale: Locale = localeHeader && isLocale(localeHeader) ? localeHeader : defaultLocale;
	const brand = getBrandForHost(requestHeaders.get('host'));
	const event = await serverFetch<Event>(`/events/${id}`);

	if (!event) {
		return {
			title: `${translate(locale, 'common.eventNotFound')} | ${brand.name}`,
		};
	}

	const t = getEventTranslation(event, locale);
	const coverImageUrl = getEventCoverImageUrl(event);

	return {
		title: `${t.title} | ${brand.name}`,
		description: t.description,
		alternates: localeAlternates(locale, `/events/${id}`),
		openGraph: {
			title: `${t.title} | ${brand.name}`,
			description: t.description,
			...(coverImageUrl
				? {
						images: [
							{
								url: coverImageUrl,
								width: 1200,
								height: 630,
								alt: t.title,
							},
						],
					}
				: {}),
			type: 'website',
			locale: localeOpenGraph[locale],
		},
		twitter: {
			card: 'summary_large_image',
			title: `${t.title} | ${brand.name}`,
			description: t.description,
			...(coverImageUrl ? { images: [coverImageUrl] } : {}),
		},
	};
}
