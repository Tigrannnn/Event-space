import { eventApi } from '@/features/events';
import { getEventCoverImageUrl } from '@event-space/shared';
import EventPageContent from './EventPageContent';
import { notFound } from 'next/navigation';

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
	const event = await eventApi.getEventById(id);

	if (!event) {
		return {
			title: 'Event Not Found | Event Flow',
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
			locale: 'en_US',
		},
		twitter: {
			card: 'summary_large_image',
			title: `${event.title} | Event Flow`,
			description: event.description,
			...(coverImageUrl ? { images: [coverImageUrl] } : {}),
		},
	};
}
