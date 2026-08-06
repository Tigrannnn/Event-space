import { Metadata } from 'next';
import FavoritesPageContent from './FavoritesPageContent';
import { PRIVATE_PAGE_ROBOTS } from '@/lib/seo';

export const metadata: Metadata = {
	title: 'Favorites | Event Flow',
	description: 'Your favorite events',
	robots: PRIVATE_PAGE_ROBOTS,
};

export default function FavoritesPage() {
	return <FavoritesPageContent />;
}
