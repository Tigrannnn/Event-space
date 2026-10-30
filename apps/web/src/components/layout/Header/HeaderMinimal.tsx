'use client';

import Link from 'next/link';
import { Heart, Search, Ticket, X } from 'lucide-react';
import { localizePath } from '@/lib/i18n/config';
import { ModalType } from '@/stores';
import LanguageMenu from '@/components/ui/LanguageSwitcher/LanguageMenu';
import ContactIcons from './ContactIcons';
import { SEARCH_FIELD_DIM, SEARCH_INPUT_PROPS, SearchDropdown } from '@/features/search';
import { AuthSkeleton } from './AuthSkeleton';
import { useHeaderControls } from './useHeaderControls';

const countBadge =
	'bg-primary absolute -top-1.5 -right-2 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] leading-none font-semibold text-white';

/**
 * The minimal skin's header: a quiet white bar, the name set as a wordmark, and the search as
 * one rounded field in the middle. Contacts and the language switch sit with the actions
 * instead of in a bar of their own.
 */
export default function HeaderMinimal() {
	const {
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
		handleKeyDown,
		searchBox,
	} = useHeaderControls();

	const actionLink =
		'relative flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-neutral-800';

	return (
		<header className="relative z-40 border-b border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
			<div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6 md:flex-nowrap md:py-4 lg:px-8">
				<Link
					href={localizePath('/', navigation.locale)}
					className="text-primary max-w-full shrink-0 text-xl font-extrabold tracking-tight sm:text-2xl"
				>
					{brand.name}
				</Link>

				<LanguageMenu className="ml-auto md:hidden" />

				<div
					ref={searchBox.containerRef}
					className="relative order-last flex w-full items-center md:order-0 md:mx-auto md:max-w-xl md:flex-1"
				>
					<div
						className={`focus-within:border-primary flex w-full items-center rounded-full border border-gray-300 bg-white py-1 pr-1 pl-5 transition-shadow focus-within:shadow-md dark:border-neutral-700 dark:bg-neutral-900 ${searchBox.open ? SEARCH_FIELD_DIM : ''}`}
					>
						<input
							{...SEARCH_INPUT_PROPS}
							value={inputValue}
							onChange={(event) => {
								setInputValue(event.target.value);
								searchBox.setOpen(true);
							}}
							onFocus={() => searchBox.setOpen(true)}
							onKeyDown={handleKeyDown}
							placeholder={translate('header.searchPlaceholder')}
							className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none dark:text-white dark:placeholder-gray-400"
						/>
						{inputValue && (
							<button
								type="button"
								onClick={() => {
									setInputValue('');
									navigation.push('/', { scroll: false });
								}}
								className="mr-1 rounded-full p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
								aria-label={translate('header.search')}
							>
								<X className="size-4" />
							</button>
						)}
						<button
							type="button"
							onClick={handleSubmitSearch}
							className="bg-primary hover:bg-primary/90 flex size-9 shrink-0 items-center justify-center rounded-full text-white transition-colors"
							aria-label={translate('header.search')}
						>
							<Search className="size-4" strokeWidth={2.5} />
						</button>
					</div>
					<SearchDropdown box={searchBox} />
				</div>

				<nav className="hidden shrink-0 items-center gap-1 md:flex">
					<ContactIcons className="mr-1 hidden xl:flex" />
					<LanguageMenu className="mr-1" />
					{!isHydrated || isUserLoading ? <AuthSkeleton hint={authHint} /> : user ? (
						<>
							<Link href={localizePath('/favorites', navigation.locale)} className={actionLink}>
								<span className="relative">
									<Heart className="size-5" />
									{myFavoritesCount > 0 && <span className={countBadge}>{myFavoritesCount}</span>}
								</span>
								{translate('header.favorites')}
							</Link>
							<Link href={localizePath('/bookings', navigation.locale)} className={actionLink}>
								<span className="relative">
									<Ticket className="size-5" />
									{myBookingsCount > 0 && <span className={countBadge}>{myBookingsCount}</span>}
								</span>
								{translate('header.bookings')}
							</Link>
							<Link
								href={localizePath('/profile', navigation.locale)}
								className="ml-1 flex items-center gap-2 rounded-full border border-gray-300 py-1.5 pr-4 pl-1.5 text-sm font-medium text-gray-800 transition-shadow hover:shadow-md dark:border-neutral-700 dark:text-gray-100"
							>
								<span className="bg-primary flex size-7 items-center justify-center rounded-full text-xs font-bold text-white uppercase">
									{user.name.trim().charAt(0)}
								</span>
								{user.name.split(' ')[0].trim().length <= 10
									? user.name.split(' ')[0]
									: translate('header.profile')}
							</Link>
						</>
					) : (
						<>
							<button type="button" onClick={() => openModal(ModalType.Login)} className={actionLink}>
								{translate('header.logIn')}
							</button>
							<button
								type="button"
								onClick={() => openModal(ModalType.Register)}
								className="bg-primary hover:bg-primary/90 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors"
							>
								{translate('header.signUp')}
							</button>
						</>
					)}
				</nav>
			</div>
		</header>
	);
}
