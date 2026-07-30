import { Metadata } from 'next';
import FavoritesPageContent from './FavoritesPageContent';

export const metadata: Metadata = {
	title: 'Favorites | Event Flow',
	description: 'Your favorite events',
};

export default function FavoritesPage() {
	return <FavoritesPageContent />;
}
