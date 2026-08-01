'use client';

import { Heart } from 'lucide-react';
import { useGetFavorites } from '@/features/favorites/hooks/useFavorites';
import Button from '@/components/ui/Buttons/Button';
import { useTranslation } from '@/hooks/translation';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import EventCard from '@/features/events/components/EventCard';
import FavoritesSkeleton from './FavoritesSkeleton';

export default function FavoritesPageContent() {
	const translate = useTranslation();
	const navigation = useLocalizedNavigation();
	const { data: favorites, isLoading } = useGetFavorites();

	if (isLoading) {
		return <FavoritesSkeleton />;
	}

	if (!favorites?.length) {
		return (
			<div className="flex min-h-full flex-col items-center justify-center px-4 py-12 text-center">
				<div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
					<Heart className="h-12 w-12" />
				</div>
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
					{translate('favorites.title')}
				</h1>
				<p className="mt-3 max-w-md text-gray-500 dark:text-gray-400">{translate('favorites.empty')}</p>
				<Button variant="primary" className="mt-6" onClick={() => navigation.push('/')}>
					{translate('favorites.browse')}
				</Button>
			</div>
		);
	}

	return (
		<div className="min-h-full px-4 py-8">
			<div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						{translate('favorites.title')}
					</h1>
					<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
						{translate('favorites.subtitle')}
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{favorites.map((event) => (
					<EventCard event={event} />
				))}
			</div>
		</div>
	);
}
