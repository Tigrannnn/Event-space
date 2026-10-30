'use client';

import Link from 'next/link';
import { Heart, Search, Ticket, User, X } from 'lucide-react';
import { localizePath } from '@/lib/i18n/config';
import { ModalType } from '@/stores';
import LanguageTile from '@/components/ui/LanguageSwitcher/LanguageTile';
import ContactTile from './ContactTile';
import { SearchDropdown } from '@/features/search';
import { AuthSkeleton } from './AuthSkeleton';
import { useHeaderControls } from './useHeaderControls';

const countBadge =
	'absolute -top-1.5 -right-2.5 inline-flex min-w-5 items-center justify-center rounded-full bg-(--brand-accent) px-1.5 py-0.5 text-[11px] leading-none font-semibold text-white';

/**
 * The market skin's header, after the big marketplaces: a white bar with the name, one wide
 * search field with a solid button on its end, and the account links as icons over captions.
 */
export default function HeaderMarket() {
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
		'relative flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-neutral-800 dark:hover:text-white';

	return (
		<header className="relative z-40 border-b border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
			<div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
				<Link
					href={localizePath('/', navigation.locale)}
					className="text-primary max-w-full shrink-0 text-2xl font-black tracking-tight"
				>
					{brand.name}
				</Link>

				<div className="ml-auto flex items-center gap-2 md:hidden">
						<ContactTile />
						<LanguageTile />
					</div>

				<div
					ref={searchBox.containerRef}
					className="border-primary relative order-last flex w-full items-stretch rounded-xl border-2 bg-white md:order-0 md:w-auto md:min-w-0 md:flex-1 dark:bg-neutral-900"
				>
					<Search className="my-auto ml-3 size-5 shrink-0 text-gray-400" />
					<input
						type="text"
						value={inputValue}
						onChange={(event) => {
							setInputValue(event.target.value);
							searchBox.setOpen(true);
						}}
						onFocus={() => searchBox.setOpen(true)}
						autoComplete="off"
						onKeyDown={handleKeyDown}
						placeholder={translate('header.searchPlaceholder')}
						className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none dark:text-white"
					/>
					{inputValue && (
						<button
							type="button"
							onClick={() => {
								setInputValue('');
								navigation.push('/', { scroll: false });
							}}
							className="px-2 text-gray-400 hover:text-gray-700 dark:hover:text-white"
							aria-label={translate('header.search')}
						>
							<X className="size-4" />
						</button>
					)}
					<button
						type="button"
						onClick={handleSubmitSearch}
						className="bg-primary -my-0.5 -mr-0.5 rounded-r-xl px-5 text-sm font-semibold text-white transition-colors hover:brightness-90 sm:px-7"
						aria-label={translate('header.search')}
					>
						<Search className="size-5 sm:hidden" />
						<span className="hidden sm:inline">{translate('header.search')}</span>
					</button>
					<SearchDropdown box={searchBox} />
				</div>

				<nav className="ml-auto hidden shrink-0 items-center gap-1 md:ml-0 md:flex">
					<ContactTile />
					<LanguageTile className="mr-1" />
					{!isHydrated || isUserLoading ? <AuthSkeleton hint={authHint} /> : user ? (
						<>
							<Link href={localizePath('/favorites', navigation.locale)} className={actionLink}>
								<span className="relative">
									<Heart className="size-6" />
									{myFavoritesCount > 0 && <span className={countBadge}>{myFavoritesCount}</span>}
								</span>
								{translate('header.favorites')}
							</Link>
							<Link href={localizePath('/bookings', navigation.locale)} className={actionLink}>
								<span className="relative">
									<Ticket className="size-6" />
									{myBookingsCount > 0 && <span className={countBadge}>{myBookingsCount}</span>}
								</span>
								{translate('header.bookings')}
							</Link>
							<Link href={localizePath('/profile', navigation.locale)} className={actionLink}>
								<User className="size-6" />
								{user.name.split(' ')[0].trim().length <= 10
									? user.name.split(' ')[0]
									: translate('header.profile')}
							</Link>
						</>
					) : (
						<>
							<button
								type="button"
								onClick={() => openModal(ModalType.Login)}
								className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-neutral-800"
							>
								{translate('header.logIn')}
							</button>
							<button
								type="button"
								onClick={() => openModal(ModalType.Register)}
								className="bg-primary rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-90"
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
