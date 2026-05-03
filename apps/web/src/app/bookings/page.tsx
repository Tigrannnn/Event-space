import { Metadata } from 'next';
import BookingsPageContent from './BookingsPageContent';

export const metadata: Metadata = {
	title: 'My Bookings | Event Flow',
	description: 'View and manage your event bookings',
};

export default function BookingsPage() {
	return <BookingsPageContent />;
}
