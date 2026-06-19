import { eventApi } from '@/features/events';
import { getEventCoverImageUrl } from '@event-space/shared';
import EventPageContent from './EventPageContent';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { defaultLocale, isLocale, localeOpenGraph, type Locale } from '@/lib/i18n/config';
import { translate } from '@/lib/i18n/messages';

interface EventPageProps {
	params: Promise<{ id: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
	const { id } = await params;

	const event = await eventApi.getEventById(id);

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
	const event = await eventApi.getEventById(id);

	if (!event) {
		return {
			title: `${translate(locale, 'common.eventNotFound')} | Event Space`,
		};
	}

	const coverImageUrl = getEventCoverImageUrl(event);

	return {
		title: `${event.title} | Event Flow`,
		description: event.description,
		openGraph: {
			title: `${event.title} | Event Flow`,
			description: event.description,
			...(coverImageUrl
				? {
						images: [
							{
								url: coverImageUrl,
								width: 1200,
								height: 630,
								alt: event.title,
							},
						],
					}
				: {}),
			type: 'website',
			locale: localeOpenGraph[locale],
		},
		twitter: {
			card: 'summary_large_image',
			title: `${event.title} | Event Flow`,
			description: event.description,
			...(coverImageUrl ? { images: [coverImageUrl] } : {}),
		},
	};
}
