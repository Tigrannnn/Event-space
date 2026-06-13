'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Buttons/Button';
import { SearchBar } from '@/components/shared/SearchBar';
import { useModalStore, ModalType } from '@/stores';
import { useCurrentUser } from '@/features/users';
import { useHydrated } from '@/hooks/useHydrated';

/**
 * Main header component.
 * - Desktop: Logo + Search + Auth buttons
 * - Mobile: Search (buttons hidden, shown in bottom nav)
 */
export default function Header() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const urlSearchQuery = searchParams.get('search') || '';
	const [inputValue, setInputValue] = useState(urlSearchQuery);
	const { openModal } = useModalStore();
	const { data: user, isLoading: isUserLoading } = useCurrentUser();
	const isHydrated = useHydrated();

	const handleSubmitSearch = useCallback(() => {
		const params = new URLSearchParams(searchParams);
		if (inputValue.trim()) {
			params.set('search', inputValue.trim());
		} else {
			params.delete('search');
		}
		router.push(`/?${params.toString()}`, { scroll: false });
	}, [inputValue, router, searchParams]);

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
						onClick={() => router.push('/')}
						className="group hidden shrink-0 cursor-pointer rounded-xl bg-white/20 px-2.5 py-1.5 text-xl leading-none font-black tracking-tighter uppercase backdrop-blur-md transition-all duration-300 hover:bg-white/25 sm:px-3 sm:py-2 sm:text-2xl md:flex lg:px-4 lg:text-3xl"
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
								placeholder="Search events..."
							/>
						</div>
						<button
							onClick={handleSubmitSearch}
							className="hidden cursor-pointer rounded-xl bg-white/20 p-2.5 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/30 sm:block sm:rounded-2xl sm:p-3"
							type="button"
						>
							<svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</button>
					</div>

					{/* Auth buttons */}
					<nav className="hidden shrink-0 items-center gap-3 md:flex">
						{!isHydrated || isUserLoading ? (
							<></>
						) : user ? (
							<>
								<Button variant="secondary" onClick={() => router.push('/bookings')}>
									Bookings
								</Button>

								<Button variant="secondary" onClick={() => router.push('/profile')}>
									{user?.name.split(' ')[0] || 'Profile'}
								</Button>
							</>
						) : (
							<>
								<Button variant="secondary" onClick={() => openModal(ModalType.Register)}>
									Sign Up
								</Button>
								<Button variant="secondary" onClick={() => openModal(ModalType.Login)}>
									Log In
								</Button>
							</>
						)}
					</nav>
				</div>
			</div>
		</header>
	);
}
