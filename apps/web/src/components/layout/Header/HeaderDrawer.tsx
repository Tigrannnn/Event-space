'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react';
import { localizePath } from '@/lib/i18n/config';
import { SearchDropdown } from '@/features/search';
import { useHeaderControls } from './useHeaderControls';
import MenuDrawer from './MenuDrawer';

/**
 * The header of the drawer skin: the name on the left, one rounded search field in the middle,
 * and a single menu button in the right corner. The account, company pages, contacts and
 * language all live behind that button, in a sheet from the right edge.
 */
export default function HeaderDrawer() {
	const {
		navigation,
		translate,
		brand,
		myBookingsCount,
		myFavoritesCount,
		inputValue,
		setInputValue,
		handleSubmitSearch,
		handleKeyDown,
		searchBox,
	} = useHeaderControls();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const pending = myBookingsCount + myFavoritesCount;

	return (
		<header className="relative z-40 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
			<div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
				<Link
					href={localizePath('/', navigation.locale)}
					className="text-primary max-w-full shrink-0 text-2xl font-black tracking-tight sm:text-3xl"
				>
					{brand.name}
				</Link>

				<button
					type="button"
					onClick={() => setIsMenuOpen(true)}
					aria-haspopup="dialog"
					aria-expanded={isMenuOpen}
					className="relative order-2 ml-auto flex h-11 cursor-pointer items-center gap-2 rounded-full bg-gray-900 pr-3 pl-5 text-sm font-bold text-white transition-colors hover:bg-gray-700 md:order-3 md:ml-0 dark:bg-white dark:text-neutral-950 dark:hover:bg-gray-200"
				>
					<span className="hidden sm:inline">{translate('header.menu')}</span>
					<Menu className="size-5" />
					{pending > 0 && (
						<span className="bg-primary absolute -top-1 -right-1 size-3 rounded-full ring-2 ring-white dark:ring-neutral-950" />
					)}
				</button>

				<div
					ref={searchBox.containerRef}
					className="relative order-last flex w-full items-center rounded-full border-2 border-gray-200 bg-white transition-colors focus-within:border-gray-900 md:order-2 md:w-auto md:min-w-0 md:flex-1 dark:border-neutral-700 dark:bg-neutral-900 dark:focus-within:border-white"
				>
					<Search className="ml-4 size-5 shrink-0 text-gray-400" />
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
							className="px-1 text-gray-400 hover:text-gray-700 dark:hover:text-white"
							aria-label={translate('header.search')}
						>
							<X className="size-4" />
						</button>
					)}
					<button
						type="button"
						onClick={handleSubmitSearch}
						className="bg-primary m-1 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-all hover:brightness-90"
						aria-label={translate('header.search')}
					>
						<Search className="size-4" />
					</button>
					<SearchDropdown box={searchBox} />
				</div>
			</div>

			<MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
		</header>
	);
}
