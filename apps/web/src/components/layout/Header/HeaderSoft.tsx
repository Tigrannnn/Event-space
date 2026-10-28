'use client';

import Link from 'next/link';
import { Heart, Search, Ticket, X } from 'lucide-react';
import { localizePath } from '@/lib/i18n/config';
import { ModalType } from '@/stores';
import LanguageMenu from '@/components/ui/LanguageSwitcher/LanguageMenu';
import ContactIcons from './ContactIcons';
import { useHeaderControls } from './useHeaderControls';

const countBadge =
	'absolute -top-1.5 -right-2 inline-flex min-w-5 items-center justify-center rounded-full bg-(--brand-accent) px-1.5 py-0.5 text-[11px] leading-none font-bold text-white';

/**
 * The soft skin's header: one band in the brand colour with a rounded bottom edge, the name set
 * as a serif wordmark, and a pill-shaped search centred underneath. Where the classic header
 * stacks a gradient strip over a gradient band, this keeps everything in a single calm one.
 */
export default function HeaderSoft() {
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
	} = useHeaderControls();

	const pill =
		'relative flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/25';

	return (
		<header className="bg-primary relative z-40 overflow-hidden rounded-b-[2rem] text-white shadow-lg sm:rounded-b-[2.5rem]">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(255,255,255,0.22),transparent_55%)]"
			/>
			<div className="relative mx-auto max-w-[1600px] px-4 pt-4 pb-5 sm:px-8 sm:pt-5 sm:pb-6">
				<div className="flex flex-wrap items-center gap-x-4 gap-y-3">
					<Link
						href={localizePath('/', navigation.locale)}
						className="flex max-w-full shrink-0 items-center gap-2.5"
					>
						<span className="size-3 rounded-full bg-(--brand-accent) ring-4 ring-white/25" />
						<span className="font-(family-name:--font-display) text-2xl font-bold tracking-tight text-white sm:text-3xl">
							{brand.name}
						</span>
					</Link>

					<LanguageMenu onDark className="ml-auto md:hidden" />

					<nav className="ml-auto hidden shrink-0 items-center gap-1.5 md:flex">
						<ContactIcons onDark className="mr-1 hidden xl:flex" />
						<LanguageMenu onDark className="mr-1" />
						{!isHydrated || isUserLoading ? null : user ? (
							<>
								<Link href={localizePath('/favorites', navigation.locale)} className={pill}>
									<span className="relative">
										<Heart className="size-[18px]" />
										{myFavoritesCount > 0 && <span className={countBadge}>{myFavoritesCount}</span>}
									</span>
									{translate('header.favorites')}
								</Link>
								<Link href={localizePath('/bookings', navigation.locale)} className={pill}>
									<span className="relative">
										<Ticket className="size-[18px]" />
										{myBookingsCount > 0 && <span className={countBadge}>{myBookingsCount}</span>}
									</span>
									{translate('header.bookings')}
								</Link>
								<Link
									href={localizePath('/profile', navigation.locale)}
									className="text-primary flex items-center gap-2 rounded-full bg-white py-1.5 pr-4 pl-1.5 text-sm font-bold transition-transform hover:scale-[1.03]"
								>
									<span className="flex size-7 items-center justify-center rounded-full bg-(--brand-accent) text-xs font-bold text-white uppercase">
										{user.name.trim().charAt(0)}
									</span>
									{user.name.split(' ')[0].trim().length <= 10
										? user.name.split(' ')[0]
										: translate('header.profile')}
								</Link>
							</>
						) : (
							<>
								<button type="button" onClick={() => openModal(ModalType.Login)} className={pill}>
									{translate('header.logIn')}
								</button>
								<button
									type="button"
									onClick={() => openModal(ModalType.Register)}
									className="text-primary rounded-full bg-white px-5 py-2 text-sm font-bold transition-transform hover:scale-[1.03]"
								>
									{translate('header.signUp')}
								</button>
							</>
						)}
					</nav>
				</div>

				<div className="mx-auto mt-4 flex w-full max-w-2xl items-center rounded-full bg-white p-1.5 pl-5 shadow-md">
					<Search className="size-5 shrink-0 text-gray-400" />
					<input
						type="text"
						value={inputValue}
						onChange={(event) => setInputValue(event.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={translate('header.searchPlaceholder')}
						className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[15px] text-gray-900 placeholder-gray-500 focus:outline-none"
					/>
					{inputValue && (
						<button
							type="button"
							onClick={() => {
								setInputValue('');
								navigation.push('/', { scroll: false });
							}}
							className="mr-1 rounded-full p-1.5 text-gray-400 hover:text-gray-700"
							aria-label={translate('header.search')}
						>
							<X className="size-4" />
						</button>
					)}
					<button
						type="button"
						onClick={handleSubmitSearch}
						className="rounded-full bg-(--brand-accent) px-6 py-2.5 text-sm font-bold text-white transition-[filter] hover:brightness-95"
					>
						{translate('header.search')}
					</button>
				</div>
			</div>
		</header>
	);
}
