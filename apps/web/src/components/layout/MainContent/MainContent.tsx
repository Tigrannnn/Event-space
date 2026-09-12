'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { stripLocaleFromPathname } from '@/lib/i18n/config';

interface MainContentProps {
	children: React.ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
	const pathname = usePathname();
	const isAdminRoute = stripLocaleFromPathname(pathname).startsWith('/admin');

	return (
		<main
			className={cn(
				'flex-1',
				isAdminRoute ? 'pb-0' : 'pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-14 lg:pb-0',
			)}
		>
			{children}
		</main>
	);
}
