'use client';

import { Heart } from 'lucide-react';
import { useToggleFavorite, useIsFavorite, useGetFavorites } from '../hooks/useFavorites';
import { useCurrentUser } from '@/features/users';
import { useTranslation } from '@/hooks/translation';
import { cn } from '@/lib/utils';
import { ModalType, useModalStore } from '@/stores';
import { Skeleton } from '@/components/ui/Skeleton';

interface FavoriteButtonProps {
	eventId: string;
	className?: string;
}

export function FavoriteButton({ eventId, className }: FavoriteButtonProps) {
	const translate = useTranslation();
	const { data: user, isLoading: isUserLoading } = useCurrentUser();
	const { isLoading: isFavoritesLoading } = useGetFavorites();
	const isFavorite = useIsFavorite(eventId);
	const toggleFavorite = useToggleFavorite();
	const { openModal } = useModalStore();

	const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		e.stopPropagation();

		if (!user) {
			openModal(ModalType.Register)
		}

		toggleFavorite.mutate({ eventId, isFavorite });
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-label={isFavorite ? translate('favorites.remove') : translate('favorites.add')}
			className={cn(
				`relative z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-gray-700 shadow-sm backdrop-blur transition-all hover:scale-105 hover:bg-gray-200/80 hover:text-gray-300 dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-300 ${isFavorite ? 'dark:hover:text-rose-400' : 'dark:hover:text-gray-700'}`,
				isFavorite &&
					'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-500 hover:text-rose-700 dark:hover:bg-rose-900/60 dark:hover:text-rose-500',
				className,
			)}
			disabled={isUserLoading || isFavoritesLoading || toggleFavorite.isPending}
		>
			{isUserLoading || (isFavoritesLoading && user) ? (
				<Skeleton className="h-5 w-5 rounded-full" />
			) : (
				<Heart className={cn('h-5 w-5 transition-all', isFavorite && 'fill-current')} />
			)}
		</button>
	);
}
