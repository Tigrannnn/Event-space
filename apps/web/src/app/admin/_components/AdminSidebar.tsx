'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { LayoutDashboard, Calendar, Users, LogOut, Ticket, CheckCircle, X } from 'lucide-react';
import { localizePath, stripLocaleFromPathname } from '@/lib/i18n/config';
import { useI18nStore } from '@/stores/i18n';

const navItems = [
	{ href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
	{ href: '/admin/events', label: 'Events', icon: Calendar },
	{ href: '/admin/bookings', label: 'Bookings', icon: Ticket },
	{ href: '/admin/checkin', label: 'Check In', icon: CheckCircle },
	{ href: '/admin/users', label: 'Users', icon: Users },
];

interface AdminSidebarProps {
	mobileOpen?: boolean;
	onNavigate?: () => void;
}

export default function AdminSidebar({ mobileOpen = false, onNavigate }: AdminSidebarProps) {
	const pathname = usePathname();
	const { locale } = useI18nStore();
	const internalPathname = stripLocaleFromPathname(pathname);

	return (
		<aside
			className={cn(
				'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-300 bg-white transition-transform duration-200 ease-out dark:border-gray-700 dark:bg-gray-900',
				'lg:static lg:z-auto lg:h-full lg:shrink-0 lg:translate-x-0',
				mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
			)}
		>
			<div className="flex items-center justify-between border-b border-gray-300 p-4 lg:hidden dark:border-gray-700">
				<p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Admin Panel</p>
				<button
					type="button"
					onClick={onNavigate}
					className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
					aria-label="Close navigation menu"
				>
					<X className="h-5 w-5" />
				</button>
			</div>

			<nav className="flex-1 space-y-1 overflow-y-auto p-4">
				{navItems.map((item) => {
					const isActive = internalPathname === item.href;
					const Icon = item.icon;

					return (
						<Link
							key={item.href}
							href={localizePath(item.href, locale)}
							onClick={onNavigate}
							className={cn(
								'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
								isActive
									? 'bg-primary/10 text-primary'
									: 'text-gray-500 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100',
							)}
						>
							<Icon className="h-5 w-5 shrink-0" />
							{item.label}
						</Link>
					);
				})}
			</nav>

			<div className="border-t border-gray-300 p-4 dark:border-gray-700">
				<Link
					href={localizePath('/', locale)}
					onClick={onNavigate}
					className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100"
				>
					<LogOut className="h-5 w-5 shrink-0" />
					Exit to Site
				</Link>
			</div>
		</aside>
	);
}
