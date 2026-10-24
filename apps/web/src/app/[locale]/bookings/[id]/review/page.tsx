import type { Metadata } from 'next';
import { PRIVATE_PAGE_ROBOTS } from '@/lib/seo';
import ReviewPageContent from './ReviewPageContent';

export const metadata: Metadata = { robots: PRIVATE_PAGE_ROBOTS };

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	return <ReviewPageContent bookingId={id} />;
}
