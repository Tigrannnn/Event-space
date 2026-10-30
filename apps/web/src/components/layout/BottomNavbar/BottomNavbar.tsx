'use client';

import { isFlatSkin } from '@/utils/skin';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { localizePath } from '@/lib/i18n/config';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { useModalStore, ModalType } from '@/stores';
import { useCurrentUser } from '@/features/users';
import { useHydrated } from '@/hooks/hydration/useHydrated';
import { Heart, HomeIcon, Ticket, UserIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/translation';
import type { MessageKey } from '@/lib/i18n/messages';
import { isRouteActive } from '@/utils/route';
import { Skeleton } from '@/components/ui/Skeleton';
import { useActiveBookingsCount } from '@/features/bookings/hooks/useBookings';
import { useFavoritesCount } from '@/features/favorites/hooks/useFavorites';
import { useAuthHint } from '@/hooks/authHint/useAuthHint';
import { useSkin } from '@/providers/BrandProvider';
import { cn } from '@/utils/cn';

/** Tab-shaped placeholders for the entries that depend on who is signed in. */
function NavSkeleton({
	count,
	className,
	iconClassName = 'size-6 rounded-full',
	labelClassName = 'h-2.5 w-10',
}: {
	count: number;
	className: string;
	iconClassName?: string;
	labelClassName?: string;
}) {
	return (
		<>
			{Array.from({ length: count }).map((_, index) => (
				<div key={index} aria-hidden className={className}>
					<Skeleton className={iconClassName} />
					<Skeleton className={labelClassName} />
				</div>
			))}
		</>
	);
}

export default function BottomNavbar() {
	const pathname = usePathname();
	const isAdminPage = isRouteActive(pathname, '/admin');
	const translate = useTranslation();
	const { locale } = useLocalizedNavigation();
	const { openModal } = useModalStore();
	const { data: user, isLoading: isUserLoading } = useCurrentUser();
	const myBookingsCount = useActiveBookingsCount();
	const myFavoritesCount = useFavoritesCount();
	const isHydrated = useHydrated();
	const authHint = useAuthHint();
	const skeletonCount = authHint === 'user' ? 3 : 1;
	const skin = useSkin();
	const isMinimal = isFlatSkin(skin);
	const isListing = skin === 'listing';
	const isSoft = skin === 'soft';

	if (isAdminPage || skin === 'drawer') {
		return null;
	}

	if (isMinimal || isSoft) {
		const items = [
			{
				key: 'home',
				href: localizePath('/', locale),
				route: '/',
				label: translate('header.home'),
				aria: translate('header.goHome'),
				Icon: HomeIcon,
				count: 0,
			},
			...(!isUserLoading && user
				? [
						{
							key: 'favorites',
							href: localizePath('/favorites', locale),
							route: '/favorites',
							label: translate('header.favorites'),
							aria: translate('header.favorites'),
							Icon: Heart,
							count: myFavoritesCount,
						},
						{
							key: 'bookings',
							href: localizePath('/bookings', locale),
							route: '/bookings',
							label: translate('header.bookings'),
							aria: translate('header.bookings'),
							Icon: Ticket,
							count: myBookingsCount,
						},
					]
				: []),
		];
		const itemClassName = (active: boolean) =>
			cn(
				'relative flex h-full flex-1 flex-col items-center justify-center gap-1 pt-2 pb-1.5 text-[11px] transition-colors',
				isSoft
					? active
						? 'bg-primary/10 text-primary rounded-full font-bold'
						: 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
					: isListing
					? active
						? 'font-semibold text-white'
						: 'text-white/70 hover:text-white'
					: active
						? 'text-primary font-semibold'
						: 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
			);

		return (
			<nav
				className={cn(
					'fixed right-0 bottom-0 left-0 z-40 flex items-stretch pb-[env(safe-area-inset-bottom)] md:hidden',
					isSoft &&
						'right-3 bottom-3 left-3 rounded-full border border-gray-200/70 bg-white/95 p-1 shadow-xl backdrop-blur dark:border-gray-700 dark:bg-gray-800/95',
					isListing
						? 'bg-primary'
						: 'border-t border-gray-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95',
				)}
			>
				{items.map(({ key, href, route, label, aria, Icon, count }) => {
					const active =
						isRouteActive(pathname, route) &&
						(route !== '/' || pathname.split('/').filter(Boolean).length <= 1);

					return (
						<Link key={key} href={href} className={itemClassName(active)} aria-label={aria}>
							<span className="relative">
								<Icon className="size-6" strokeWidth={active ? 2.25 : 1.6} />
								{count > 0 && (
									<span
										className={cn(
											'absolute -top-1 -right-2.5 flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-4 font-semibold text-white',
											isListing ? 'bg-(--brand-accent)' : 'bg-primary',
										)}
									>
										{count}
									</span>
								)}
							</span>
							{label}
						</Link>
					);
				})}

				{isUserLoading && <NavSkeleton count={skeletonCount} className={itemClassName(false)} />}

				{!isUserLoading &&
					(user ? (
						<Link
							href={localizePath('/profile', locale)}
							className={itemClassName(isRouteActive(pathname, '/profile'))}
							aria-label={translate('header.goProfile')}
						>
							<UserIcon
								className="size-6"
								strokeWidth={isRouteActive(pathname, '/profile') ? 2.25 : 1.6}
							/>
							{translate('header.profile')}
						</Link>
					) : (
						<button
							type="button"
							onClick={() => openModal(ModalType.Register)}
							className={itemClassName(false)}
							aria-label={translate('header.signUp')}
						>
							<UserIcon className="size-6" strokeWidth={1.6} />
							{translate('header.signUp')}
						</button>
					))}
			</nav>
		);
	}

	// Links rather than router.push: Next prefetches a Link's route (down to its
	// loading boundary) before the click, so the skeleton appears immediately instead
	// of the tab sitting dead until the server answers. The hrefs carry the locale —
	// pushing a bare "/profile" made the middleware redirect first, costing a whole
	// extra round trip before anything could render.
	const linkClassName =
		'text-primary flex h-full w-full flex-col items-center justify-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-800';
	const badgeClassName =
		'py-0.2 absolute top-1 right-7 inline-flex items-center justify-center rounded-full bg-red-600 px-1 text-[8px] font-semibold text-white';

	return (
		// hidden on md+, visible on mobile only
		<nav className="fixed right-0 bottom-0 left-0 z-40 mx-auto flex min-h-12 max-w-7xl items-center justify-around border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] sm:min-h-10 md:hidden dark:border-gray-800 dark:bg-gray-900">
			<Link
				href={localizePath('/', locale)}
				className={linkClassName}
				aria-label={translate('header.goHome')}
			>
				<HomeIcon height={16} />
				<span className="mt-1 text-[10px] font-medium sm:text-xs">{translate('header.home')}</span>
			</Link>

			{isUserLoading && (
				<NavSkeleton
					count={skeletonCount}
					className={linkClassName}
					iconClassName="size-4 rounded-full"
					labelClassName="mt-1.5 h-2.5 w-10"
				/>
			)}

			{!isUserLoading && user && (
				<Link
					href={localizePath('/favorites', locale)}
					className={`${linkClassName} relative`}
					aria-label={translate('header.favorites')}
				>
					{myFavoritesCount > 0 && <span className={badgeClassName}>{myFavoritesCount}</span>}
					<Heart height={16} />
					<span className="mt-1 text-[10px] font-medium sm:text-xs">
						{translate('header.favorites')}
					</span>
				</Link>
			)}

			{!isUserLoading && user && (
				<Link
					href={localizePath('/bookings', locale)}
					className={`${linkClassName} relative`}
					aria-label={translate('header.bookings')}
				>
					{myBookingsCount > 0 && <span className={badgeClassName}>{myBookingsCount}</span>}
					<Ticket height={16} />
					<span className="mt-1 text-[10px] font-medium sm:text-xs">{translate('header.bookings')}</span>
				</Link>
			)}

			{!isUserLoading &&
				(user ? (
					<Link
						href={localizePath('/profile', locale)}
						className={linkClassName}
						aria-label={translate('header.goProfile')}
					>
						<UserIcon height={16} />
						<span className="mt-1 text-[10px] font-medium sm:text-xs">{translate('header.profile')}</span>
					</Link>
				) : (
					// Signing up opens a modal — an action, not a destination, so not a link.
					<button
						onClick={() => openModal(ModalType.Register)}
						className={linkClassName}
						aria-label={translate('header.signUp')}
					>
						<UserIcon height={16} />
						<span className="mt-1 text-[10px] font-medium sm:text-xs">{translate('header.signUp')}</span>
					</button>
				))}
		</nav>
	);
}
