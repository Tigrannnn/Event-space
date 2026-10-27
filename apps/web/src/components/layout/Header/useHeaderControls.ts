'use client';

import React, { useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useModalStore } from '@/stores';
import { useCurrentUser } from '@/features/users';
import { useActiveBookingsCount } from '@/features/bookings/hooks/useBookings';
import { useFavoritesCount } from '@/features/favorites/hooks/useFavorites';
import { useHydrated } from '@/hooks/hydration/useHydrated';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { useTranslation } from '@/hooks/translation';
import { useBrand } from '@/providers/BrandProvider';

/** What every header variant needs: the search box, the signed-in visitor and their counters. */
export function useHeaderControls() {
	const navigation = useLocalizedNavigation();
	const searchParams = useSearchParams();
	const urlSearchQuery = searchParams.get('search') || '';
	const [inputValue, setInputValue] = useState(urlSearchQuery);
	const translate = useTranslation();
	const brand = useBrand();
	const { openModal } = useModalStore();
	const { data: user, isLoading: isUserLoading } = useCurrentUser();
	const myBookingsCount = useActiveBookingsCount();
	const myFavoritesCount = useFavoritesCount();
	const isHydrated = useHydrated();

	const handleSubmitSearch = useCallback(() => {
		const params = new URLSearchParams(searchParams);
		if (inputValue.trim()) {
			params.set('search', inputValue.trim());
		} else {
			params.delete('search');
		}
		const query = params.toString();
		navigation.push(query ? `/?${query}` : '/', { scroll: false });
	}, [inputValue, navigation, searchParams]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter') {
				handleSubmitSearch();
			}
		},
		[handleSubmitSearch],
	);

	return {
		navigation,
		translate,
		brand,
		openModal,
		user,
		isUserLoading,
		isHydrated,
		myBookingsCount,
		myFavoritesCount,
		inputValue,
		setInputValue,
		handleSubmitSearch,
		handleKeyDown,
	};
}
