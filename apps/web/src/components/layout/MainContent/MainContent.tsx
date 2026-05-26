'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

interface MainContentProps {
	children: React.ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
	const pathname = usePathname();
	const isAdminRoute = pathname.startsWith('/admin');

	return (
		<main
			className={cn(
				'min-h-0 flex-1 overflow-auto',
				isAdminRoute ? 'pb-0' : 'pb-16 sm:pb-14 lg:pb-0',
			)}
		>
			{children}
		</main>
	);
}
