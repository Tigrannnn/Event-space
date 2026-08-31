import { Metadata } from 'next';
import { headers } from 'next/headers';
import FavoritesPageContent from './FavoritesPageContent';
import { PRIVATE_PAGE_ROBOTS } from '@/lib/seo';
import { getBrandForHost } from '@/config/brands';

export async function generateMetadata(): Promise<Metadata> {
	const brand = getBrandForHost((await headers()).get('host'));

	return {
		title: `Favorites | ${brand.name}`,
		description: 'Your favorite events',
		robots: PRIVATE_PAGE_ROBOTS,
	};
}

export default function FavoritesPage() {
	return <FavoritesPageContent />;
}
