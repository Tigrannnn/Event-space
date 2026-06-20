'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useModalStore, ModalType } from '@/stores';
import { useCurrentUser } from '@/features/users';
import { useHydrated } from '@/hooks/hydration/useHydrated';
import { HomeIcon, Ticket, UserIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/translation';
import { isRouteActive } from '@/utils/route';
import { Skeleton } from '@/components/ui/Skeleton';

export default function BottomNavbar() {
	const pathname = usePathname();
	const isAdminPage = isRouteActive(pathname, '/admin');
	const translate = useTranslation();
	const router = useRouter();
	const { openModal } = useModalStore();
	const { data: user, isLoading: isUserLoading } = useCurrentUser();
	const isHydrated = useHydrated();

	if (isAdminPage) {
		return null;
	}

	return (
		// hidden on md+, visible on mobile only
		<nav className="fixed right-0 bottom-0 left-0 z-40 mx-auto flex h-12 max-w-7xl items-center justify-around border-t border-gray-200 bg-white sm:h-10 md:hidden dark:border-gray-800 dark:bg-gray-900">
			<button
				onClick={() => router.push('/')}
				className="text-primary flex h-full w-full flex-col items-center justify-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
				aria-label={translate('header.goHome')}
			>
				<HomeIcon height={16} />
				<span className="mt-1 text-[10px] font-medium sm:text-xs">{translate('header.home')}</span>
			</button>

			{!isUserLoading && user && (
				<button
					onClick={() => router.push('/bookings')}
					className="text-primary flex h-full w-full flex-col items-center justify-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
					aria-label={translate('header.bookings')}
				>
					<Ticket height={16} />
					<span className="mt-1 text-[10px] font-medium sm:text-xs">{translate('header.bookings')}</span>
				</button>
			)}

			<button
				onClick={() => (user ? router.push('/profile') : openModal(ModalType.Register))}
				className="text-primary flex h-full w-full flex-col items-center justify-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
				aria-label={!isHydrated ? translate('common.loading') : user ? translate('header.goProfile') : translate('header.signUp')}
			>
				<UserIcon height={16} />
				<span className="mt-1 text-[10px] font-medium sm:text-xs">
					{!isHydrated || isUserLoading ? <Skeleton className="h-4 w-full" /> : user ? translate('header.profile') : translate('header.signUp')}
				</span>
			</button>
		</nav>
	);
}
