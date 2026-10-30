'use client';

import Link from 'next/link';
import { Heart, Search, Ticket, X } from 'lucide-react';
import { localizePath } from '@/lib/i18n/config';
import { ModalType } from '@/stores';
import LanguageCode from '@/components/ui/LanguageSwitcher/LanguageCode';
import ContactIcons from './ContactIcons';
import { SearchDropdown } from '@/features/search';
import { useHeaderControls } from './useHeaderControls';

const countBadge =
	'absolute -top-1.5 -right-2 inline-flex min-w-5 items-center justify-center rounded-full bg-(--brand-accent) px-1.5 py-0.5 text-[11px] leading-none font-semibold text-white';

/**
 * The listing skin's header: a solid bar in the brand colour with the name and the account
 * links on it, and a wide search field under them framed in the second brand colour.
 */
export default function HeaderListing() {
	const {
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
		searchBox,
	} = useHeaderControls();

	const actionLink =
		'relative flex min-w-16 flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-[11px] font-medium text-white/90 transition-colors hover:bg-white/15 hover:text-white';

	return (
		<header className="bg-primary relative z-40 text-white">
			<div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-3 px-4 pt-3 pb-4 sm:px-6 lg:px-8">
				<Link
					href={localizePath('/', navigation.locale)}
					className="max-w-full shrink-0 text-xl font-bold tracking-tight text-white sm:text-2xl"
				>
					{brand.name}
				</Link>

				<LanguageCode onDark className="ml-auto md:hidden" />

				<nav className="ml-auto hidden shrink-0 items-center gap-1 md:flex">
					<ContactIcons onDark className="mr-2 hidden gap-1.5 xl:flex" />
					<LanguageCode onDark className="mr-2" />
					{!isHydrated || isUserLoading ? null : user ? (
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
								className="ml-1 flex items-center gap-2 rounded-md border border-white/60 py-1.5 pr-4 pl-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15"
							>
								<span className="text-primary flex size-7 items-center justify-center rounded bg-white text-xs font-bold uppercase">
									{user.name.trim().charAt(0)}
								</span>
								{user.name.split(' ')[0].trim().length <= 10
									? user.name.split(' ')[0]
									: translate('header.profile')}
							</Link>
						</>
					) : (
						<>
							<button
								type="button"
								onClick={() => openModal(ModalType.Register)}
								className="text-primary rounded-md bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/90"
							>
								{translate('header.signUp')}
							</button>
							<button
								type="button"
								onClick={() => openModal(ModalType.Login)}
								className="rounded-md border border-white px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15"
							>
								{translate('header.logIn')}
							</button>
						</>
					)}
				</nav>

				<div
					ref={searchBox.containerRef}
					className="relative order-last flex w-full items-stretch rounded-md bg-white"
				>
					<Search className="my-auto ml-3 size-5 shrink-0 text-gray-500" />
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
						className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[15px] text-gray-900 placeholder-gray-500 focus:outline-none"
					/>
					{inputValue && (
						<button
							type="button"
							onClick={() => {
								setInputValue('');
								navigation.push('/', { scroll: false });
							}}
							className="px-2 text-gray-400 hover:text-gray-700"
							aria-label={translate('header.search')}
						>
							<X className="size-4" />
						</button>
					)}
					<button
						type="button"
						onClick={handleSubmitSearch}
						className="bg-primary m-1 rounded px-6 text-sm font-semibold text-white transition-colors hover:brightness-90"
					>
						{translate('header.search')}
					</button>
					<SearchDropdown box={searchBox} />
				</div>
			</div>
		</header>
	);
}
