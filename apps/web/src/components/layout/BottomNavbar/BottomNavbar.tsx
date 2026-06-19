'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useModalStore, ModalType } from '@/stores';
import { useCurrentUser } from '@/features/users';
import { useHydrated } from '@/hooks/useHydrated';
import { HomeIcon, UserIcon } from 'lucide-react';
import { useI18nStore } from '@/stores/i18n';

export default function BottomNavbar() {
	const { translate } = useI18nStore();
	const pathname = usePathname();
	const router = useRouter();
	const { openModal } = useModalStore();
	const { data: user } = useCurrentUser();
	const isHydrated = useHydrated();

	if (pathname.startsWith('/admin')) {
		return null;
	}

	return (
		// hidden on md+, visible on mobile only
		<nav className="fixed right-0 bottom-0 left-0 z-40 mx-auto flex h-16 max-w-7xl items-center justify-around border-t border-gray-200 bg-white sm:h-14 md:hidden dark:border-gray-800 dark:bg-gray-900">
			{/* Home Button */}
			<button
				onClick={() => router.push('/')}
				className="text-primary flex h-full w-full flex-col items-center justify-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
				aria-label={translate('header.goHome')}
			>
				<HomeIcon />
				<span className="mt-1 text-[13px] font-medium sm:text-xs">{translate('header.home')}</span>
			</button>

			{/* Profile Button */}
			<button
				onClick={() => (user ? router.push('/profile') : openModal(ModalType.Register))}
				className="text-primary flex h-full w-full flex-col items-center justify-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
				aria-label={isHydrated && user ? translate('header.goProfile') : translate('header.signUp')}
			>
				<UserIcon />
				<span className="mt-1 text-[13px] font-medium sm:text-xs">
					{isHydrated && user ? translate('header.profile') : translate('header.signUp')}
				</span>
			</button>
		</nav>
	);
}
