'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { cn } from '@/utils/cn';
import AdminSidebar from './AdminSidebar';
import { stripLocaleFromPathname } from '@/lib/i18n/config';

const PAGE_TITLES: Record<string, string> = {
	'/admin/dashboard': 'Dashboard',
	'/admin/events': 'Events',
	'/admin/bookings': 'Bookings',
	'/admin/users': 'Users',
	'/admin/categories': 'Categories',
};

function getPageTitle(pathname: string) {
	return PAGE_TITLES[pathname] ?? 'Admin';
}

interface AdminShellProps {
	children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);
	const pageTitle = getPageTitle(stripLocaleFromPathname(pathname));

	useEffect(() => {
		if (!mobileOpen) {
			return;
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [mobileOpen]);

	return (
		<div className="flex h-full min-h-0">
			{mobileOpen && (
				<button
					type="button"
					className="fixed inset-0 z-40 bg-black/50 lg:hidden"
					onClick={() => setMobileOpen(false)}
					aria-label="Close navigation menu"
				/>
			)}

			<AdminSidebar mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />

			<div className="flex min-h-0 min-w-0 flex-1 flex-col">
				<header className="flex shrink-0 items-center gap-3 border-b border-gray-300 bg-white px-3 py-3 dark:border-gray-700 dark:bg-gray-800 lg:hidden">
					<button
						type="button"
						onClick={() => setMobileOpen(true)}
						className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
						aria-label="Open navigation menu"
						aria-expanded={mobileOpen}
					>
						<Menu className="h-5 w-5" />
					</button>
					<h1 className="truncate text-lg font-semibold text-gray-900 dark:text-gray-100">{pageTitle}</h1>
				</header>

				<main className={cn('flex-1 overflow-auto p-2 sm:p-3')}>{children}</main>
			</div>
		</div>
	);
}
