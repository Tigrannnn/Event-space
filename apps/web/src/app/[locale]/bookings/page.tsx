import { Metadata } from 'next';
import { headers } from 'next/headers';
import BookingsPageContent from './BookingsPageContent';
import { PRIVATE_PAGE_ROBOTS } from '@/lib/seo';
import { getBrandForHost } from '@/config/brands';

export async function generateMetadata(): Promise<Metadata> {
	const brand = getBrandForHost((await headers()).get('host'));

	return {
		title: `My Bookings | ${brand.name}`,
		description: 'View and manage your event bookings',
		robots: PRIVATE_PAGE_ROBOTS,
	};
}

export default function BookingsPage() {
	return <BookingsPageContent />;
}
