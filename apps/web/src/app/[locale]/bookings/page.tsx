import { Metadata } from 'next';
import BookingsPageContent from './BookingsPageContent';
import { PRIVATE_PAGE_ROBOTS } from '@/lib/seo';

export const metadata: Metadata = {
	title: 'My Bookings | Event Flow',
	description: 'View and manage your event bookings',
	robots: PRIVATE_PAGE_ROBOTS,
};

export default function BookingsPage() {
	return <BookingsPageContent />;
}
