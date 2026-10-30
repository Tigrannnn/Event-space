import type { Metadata } from 'next';
import { PRIVATE_PAGE_ROBOTS } from '@/lib/seo';
import BookingLinkContent from './BookingLinkContent';

export const metadata: Metadata = { robots: PRIVATE_PAGE_ROBOTS };

export default async function BookingLinkPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	return <BookingLinkContent bookingId={id} />;
}
