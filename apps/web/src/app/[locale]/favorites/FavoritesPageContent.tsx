'use client';

import { useCallback, useMemo } from 'react';
import { Heart } from 'lucide-react';
import { useGetFavorites } from '@/features/favorites/hooks/useFavorites';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import { useTranslation } from '@/hooks/translation';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { useSkin } from '@/providers/BrandProvider';
import EventCard from '@/features/events/components/EventCard';
import FavoritesSkeleton from './FavoritesSkeleton';
import LoadMoreTrigger from '@/components/ui/LoadMoreTrigger';
import { useIntersectionObserver } from '@/hooks/observer/useIntersectionObserver';

export default function FavoritesPageContent() {
	const translate = useTranslation();
	const navigation = useLocalizedNavigation();
	const skin = useSkin();
	const isListing = skin === 'listing';
	const isSoft = skin === 'soft';
	const isMarket = skin === 'market';
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetFavorites();

	const favorites = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

	const loadMoreRef = useIntersectionObserver(
		useCallback(() => {
			if (hasNextPage && !isFetchingNextPage) {
				void fetchNextPage();
			}
		}, [hasNextPage, isFetchingNextPage, fetchNextPage]),
		{ enabled: hasNextPage && !isFetchingNextPage, rootMargin: '200px' },
	);

	if (isLoading) {
		return <FavoritesSkeleton />;
	}

	if (!favorites.length) {
		return (
			<EmptyState
				icon={Heart}
				tone="rose"
				headingAs="h1"
				title={translate('favorites.title')}
				description={translate('favorites.empty')}
				actionLabel={translate('favorites.browse')}
				onAction={() => navigation.push('/')}
			/>
		);
	}

	return (
		<div
			className={
				isListing
					? 'mx-auto min-h-full w-full max-w-[1336px] px-4 py-6 sm:px-6 lg:px-8'
					: isSoft
						? 'mx-auto min-h-full w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8'
						: isMarket
							? 'mx-auto min-h-full w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8'
							: 'min-h-full px-4 py-8'
			}
		>
			<div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900 dark:text-white">
						{isSoft && (
							<span className="flex size-11 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/40">
								<Heart className="size-5 fill-current" />
							</span>
						)}
						{translate('favorites.title')}
					</h1>
					<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
						{translate('favorites.subtitle')}
					</p>
				</div>
			</div>

			<div
				className={
					isListing
						? 'flex flex-col gap-4'
						: isSoft
							? 'grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 2xl:grid-cols-4'
							: isMarket
								? 'grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-4 xl:grid-cols-5'
								: 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
				}
			>
				{favorites.map((event) => (
					<EventCard key={event.id} event={event} />
				))}

				<LoadMoreTrigger
					isLoading={isFetchingNextPage}
					isEnabled={hasNextPage}
					loadMoreRef={loadMoreRef}
				/>
			</div>
		</div>
	);
}
