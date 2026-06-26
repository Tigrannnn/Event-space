'use client';

import React, { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Buttons/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { useModalStore, ModalType } from '@/stores';
import { useCurrentUser } from '@/features/users';
import { useGetMyBookings } from '@/features/bookings/hooks/useBookings';
import { useHydrated } from '@/hooks/hydration/useHydrated';

import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { useTranslation } from '@/hooks/translation';
import { SearchIcon } from 'lucide-react';

/**
 * Main header component.
 * - Desktop: Logo + Search + Auth buttons
 * - Mobile: Search (buttons hidden, shown in bottom nav)
 */
export default function Header() {
	const navigation = useLocalizedNavigation();
	const searchParams = useSearchParams();
	const urlSearchQuery = searchParams.get('search') || '';
	const [inputValue, setInputValue] = useState(urlSearchQuery);
	const translate = useTranslation();
	const { openModal } = useModalStore();
	const { data: user, isLoading: isUserLoading } = useCurrentUser();
	const { data: myBookings } = useGetMyBookings();
	const myBookingsCount = myBookings?.length ?? 0;
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

	return (
		<header className="from-primary to-accent relative top-0 z-40 bg-linear-to-br px-2 py-4 sm:px-8 md:py-6 lg:py-10">
			<div className="mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between gap-4">
					{/* Logo */}
					<div
						onClick={() => navigation.push('/')}
						className="group hidden shrink-0 cursor-pointer rounded-xl bg-white/40 px-2.5 py-1.5 text-xl leading-none font-black tracking-tighter uppercase backdrop-blur-md transition-all duration-300 hover:bg-white/25 sm:px-3 sm:py-2 sm:text-2xl md:flex lg:px-4 lg:text-3xl"
					>
						<span className="text-primary group-hover:text-primary/80 transition-colors duration-300">
							Event
						</span>
						<span className="text-primary/60 mx-0.5"> </span>
						<span className="text-accent group-hover:text-accent/80 transition-colors duration-300">
							Space
						</span>
					</div>
					{/* Search with button */}
					<div className="flex min-w-0 flex-1 items-center gap-2">
						<div className="flex-1">
							<SearchBar
								value={inputValue}
								onChange={setInputValue}
								onKeyDown={handleKeyDown}
								placeholder={translate('header.searchPlaceholder')}
							/>
						</div>
						<button
							onClick={handleSubmitSearch}
							className="hidden cursor-pointer rounded-xl bg-white/20 p-2.5 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/30 sm:block sm:rounded-xl sm:p-3 lg:rounded-2xl"
							type="button"
							aria-label={translate('header.search')}
						>
							<SearchIcon className="h-4 w-4 lg:h-6 lg:w-6" />
						</button>
					</div>

					{/* Auth buttons */}
					<nav className="hidden shrink-0 items-center gap-3 md:flex">
						{!isHydrated || isUserLoading ? (
							<></>
						) : user ? (
							<>
								<Button
									variant="secondary"
									onClick={() => navigation.push('/bookings')}
									className="relative px-4 py-2.5 text-xs lg:px-6 lg:py-3 lg:text-base"
								>
									{translate('header.bookings')}
									{myBookingsCount > 0 && (
										<span className="absolute -top-1 -right-2 inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
											{myBookingsCount}
										</span>
									)}
								</Button>

								<Button
									variant="secondary"
									onClick={() => navigation.push('/profile')}
									className="px-4 py-2.5 text-xs lg:px-6 lg:py-3 lg:text-base"
								>
									{user.name.trim().length <= 10 ? user.name.split(' ')[0] : translate('header.profile')}
								</Button>
							</>
						) : (
							<>
								<Button
									variant="secondary"
									onClick={() => openModal(ModalType.Register)}
									className="px-4 py-2.5 text-xs lg:px-6 lg:py-3 lg:text-base"
								>
									{translate('header.signUp')}
								</Button>
								<Button
									variant="secondary"
									onClick={() => openModal(ModalType.Login)}
									className="px-4 py-2.5 text-xs lg:px-6 lg:py-3 lg:text-base"
								>
									{translate('header.logIn')}
								</Button>
							</>
						)}
					</nav>
				</div>
			</div>
		</header>
	);
}
