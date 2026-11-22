'use client';

import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Heart, Search, Ticket, User, X } from 'lucide-react';
import { localizePath } from '@/lib/i18n/config';
import { ModalType } from '@/stores';
import LanguageTile from '@/components/ui/LanguageSwitcher/LanguageTile';
import ContactTile from './ContactTile';
import { SEARCH_INPUT_PROPS, SearchDropdown } from '@/features/search';
import { useHeaderControls } from './useHeaderControls';
import { isRouteActive } from '@/utils/route';
import { cn } from '@/utils/cn';

const countBadge =
	'absolute -top-1.5 -right-2.5 inline-flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-[11px] leading-none font-bold text-primary';

const tile = 'h-11 rounded-full px-4';

export default function HeaderCapsule() {
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
	const pathname = usePathname();

	const links = [
		{ href: '/', label: translate('header.home') },
		{ href: '/about', label: translate('header.aboutUs') },
	];

	const isLoading = !isHydrated || isUserLoading;
	const accountLink =
		'relative flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white';

	const account = isLoading ? (
		<div
			className={cn(
				'h-10 animate-pulse rounded-full bg-white/15',
				authHint === 'user' ? 'w-52' : 'w-40',
			)}
		/>
	) : user ? (
		<div className="flex items-center gap-1">
			<Link href={localizePath('/favorites', navigation.locale)} className={accountLink}>
				<span className="relative">
					<Heart className="size-5" />
					{myFavoritesCount > 0 && <span className={countBadge}>{myFavoritesCount}</span>}
				</span>
				{translate('header.favorites')}
			</Link>
			<Link href={localizePath('/bookings', navigation.locale)} className={accountLink}>
				<span className="relative">
					<Ticket className="size-5" />
					{myBookingsCount > 0 && <span className={countBadge}>{myBookingsCount}</span>}
				</span>
				{translate('header.bookings')}
			</Link>
			<Link href={localizePath('/profile', navigation.locale)} className={accountLink}>
				<User className="size-5" />
				{user.name.split(' ')[0].trim().length <= 10
					? user.name.split(' ')[0]
					: translate('header.profile')}
			</Link>
		</div>
	) : (
		<div className="flex items-center gap-2">
			<button
				type="button"
				onClick={() => openModal(ModalType.Login)}
				className="flex items-center gap-2 rounded-full px-4 py-2.5 text-base font-bold text-white transition-colors hover:bg-white/10"
			>
				{translate('header.logIn')}
				<ArrowUpRight className="size-5" strokeWidth={2.5} />
			</button>
			<button
				type="button"
				onClick={() => openModal(ModalType.Register)}
				className="text-primary rounded-full bg-white px-5 py-2.5 text-sm font-bold transition-colors hover:bg-white/90"
			>
				{translate('header.signUp')}
			</button>
		</div>
	);

	return (
		<header className="relative z-40 flex items-stretch border-b border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-950">
			<div className="mx-auto flex max-w-[1400px] min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6 md:flex-nowrap md:py-4 lg:px-8">
				<Link
					href={localizePath('/', navigation.locale)}
					aria-label={translate('header.goHome')}
					className="shrink-0"
				>
					{brand.logo ? (
						<Image
							src={brand.logo}
							alt={brand.name}
							width={181}
							height={42}
							priority
							unoptimized
							className="h-8 w-auto sm:h-9 dark:brightness-0 dark:invert"
						/>
					) : (
						<span className="text-primary text-2xl font-black tracking-tight dark:text-white">
							{brand.name}
						</span>
					)}
				</Link>

				<nav className="hidden shrink-0 items-center gap-3 xl:flex">
					{links.map((link, index) => (
						<Fragment key={link.href}>
							{index > 0 && <span className="text-primary/40 text-xs dark:text-white/30">✦</span>}
							<Link
								href={localizePath(link.href, navigation.locale)}
								className={cn(
									'text-primary relative py-1 text-[15px] font-bold transition-colors dark:text-white',
									isRouteActive(pathname, link.href) &&
										'after:bg-primary after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full dark:after:bg-white',
								)}
							>
								{link.label}
							</Link>
						</Fragment>
					))}
				</nav>

				<div className="ml-auto flex items-center gap-2 md:hidden">
					<ContactTile className={tile} />
					<LanguageTile className={tile} />
				</div>

				<div
					ref={searchBox.containerRef}
					className="focus-within:border-primary/40 relative order-last flex w-full items-center rounded-full border border-gray-200 bg-gray-50 p-1 pl-5 transition-colors md:order-0 md:w-auto md:min-w-0 md:flex-1 dark:border-neutral-800 dark:bg-neutral-900"
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
						className="text-primary min-w-0 flex-1 bg-transparent py-2 text-[15px] font-medium placeholder-gray-400 focus:outline-none dark:text-white"
					/>
					{inputValue && (
						<button
							type="button"
							onClick={() => setInputValue('')}
							className="px-2 text-gray-400 hover:text-gray-700 dark:hover:text-white"
							aria-label={translate('common.clearSearch')}
						>
							<X className="size-4" />
						</button>
					)}
					<button
						type="button"
						onClick={handleSubmitSearch}
						className="bg-primary flex size-10 shrink-0 items-center justify-center rounded-full text-white transition-all hover:brightness-125"
						aria-label={translate('header.search')}
					>
						<Search className="size-4.5" />
					</button>
					<SearchDropdown box={searchBox} />
				</div>

				<div className="hidden shrink-0 items-center gap-2 md:flex">
					<ContactTile className={tile} />
					<LanguageTile className={tile} />
				</div>
			</div>

			<div className="bg-primary hidden shrink-0 items-center rounded-bl-[2.5rem] py-3 pr-5 pl-7 md:flex lg:pr-8 lg:pl-10">
				{account}
			</div>
		</header>
	);
}
