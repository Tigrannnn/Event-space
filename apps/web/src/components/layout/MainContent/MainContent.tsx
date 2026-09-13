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
				// A column, so a page root can fill the leftover height with flex-1 —
				// percentage heights have nothing to resolve against now that the
				// document, not <main>, is what scrolls.
				'flex flex-1 flex-col',
				isAdminRoute ? 'pb-0' : 'pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-14 lg:pb-0',
			)}
		>
			{children}
		</main>
	);
}
