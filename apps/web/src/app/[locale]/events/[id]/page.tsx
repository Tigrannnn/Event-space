import { serverFetch } from '@/lib/server.api';
import { getEventCoverImageUrl, getEventTranslation, Locale, Event } from '@event-space/shared';
import EventPageContent from './EventPageContent';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { defaultLocale, isLocale, localeOpenGraph } from '@/lib/i18n/config';
import { translate } from '@/lib/i18n/messages';

interface EventPageProps {
	params: Promise<{ id: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
	const { id } = await params;

	const event = await serverFetch<Event>(`/events/${id}`);

	if (!event) {
		notFound();
	}

	return <EventPageContent initialEvent={event} key={event.id} />;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const localeHeader = (await headers()).get('x-locale');
	const locale: Locale = localeHeader && isLocale(localeHeader) ? localeHeader : defaultLocale;
	const event = await serverFetch<Event>(`/events/${id}`);

	if (!event) {
		return {
			title: `${translate(locale, 'common.eventNotFound')} | Event Space`,
		};
	}

	const t = getEventTranslation(event, locale);
	const coverImageUrl = getEventCoverImageUrl(event);

	return {
		title: `${t.title} | Event Flow`,
		description: t.description,
		openGraph: {
			title: `${t.title} | Event Flow`,
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
			title: `${t.title} | Event Flow`,
			description: t.description,
			...(coverImageUrl ? { images: [coverImageUrl] } : {}),
		},
	};
}
