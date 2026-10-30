'use client';

import { useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useModalStore } from '@/stores';
import { useCurrentUser } from '@/features/users';
import { useActiveBookingsCount } from '@/features/bookings/hooks/useBookings';
import { useFavoritesCount } from '@/features/favorites/hooks/useFavorites';
import { useHydrated } from '@/hooks/hydration/useHydrated';
import { useAuthHint } from '@/hooks/authHint/useAuthHint';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { useTranslation } from '@/hooks/translation';
import { useBrand } from '@/providers/BrandProvider';
import { searchApi, useSearchBox } from '@/features/search';

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
	const authHint = useAuthHint();

	const submitSearch = useCallback(
		(value: string) => {
			const text = value.trim();
			const params = new URLSearchParams(searchParams);
			if (text) {
				params.set('search', text);
			} else {
				params.delete('search');
			}
			const query = params.toString();
			navigation.push(query ? `/?${query}` : '/', { scroll: false });

			if (user && text.length >= 2) {
				void searchApi.recordQuery(text).catch(() => undefined);
			}
		},
		[navigation, searchParams, user],
	);

	const handleSubmitSearch = useCallback(() => submitSearch(inputValue), [submitSearch, inputValue]);

	const searchBox = useSearchBox({
		value: inputValue,
		setValue: setInputValue,
		submit: submitSearch,
	});

	return {
		navigation,
		translate,
		brand,
		openModal,
		user,
		isUserLoading,
		isHydrated,
		authHint,
		myBookingsCount,
		myFavoritesCount,
		inputValue,
		setInputValue,
		handleSubmitSearch,
		handleKeyDown: searchBox.onKeyDown,
		searchBox,
	};
}
