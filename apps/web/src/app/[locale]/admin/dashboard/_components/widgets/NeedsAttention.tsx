'use client';

import Link from 'next/link';
import { addDays, startOfToday } from 'date-fns';
import { Clock, FileText, CalendarClock, UserCheck } from 'lucide-react';
import type { DashboardStats } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { localizePath } from '@/lib/i18n/config';
import { formatDateParam } from '@/components/filters';

interface NeedsAttentionProps {
	stats: DashboardStats;
}

export default function NeedsAttention({ stats }: NeedsAttentionProps) {
	const translate = useTranslation();
	const locale = translate.locale;
	const weekStart = startOfToday();
	const thisWeekHref = `/admin/events?startDate=${formatDateParam(weekStart)}&endDate=${formatDateParam(addDays(weekStart, 6))}`;
	// Each card lands on the list already narrowed to what the number counts, so the follow-up
	// action takes one click instead of re-picking the filter by hand.
	const attentionItems = [
		{
			label: translate('admin.pendingBookings'),
			value: stats.attention.pendingBookings,
			href: '/admin/bookings?status=PENDING',
			icon: Clock,
		},
		{
			label: translate('admin.draftEvents'),
			value: stats.attention.draftEvents,
			href: '/admin/events?status=DRAFT',
			icon: FileText,
		},
		{
			label: translate('admin.eventsThisWeek'),
			value: stats.attention.eventsThisWeek,
			href: thisWeekHref,
			icon: CalendarClock,
		},
		{
			label: translate('admin.pendingUsers'),
			value: stats.attention.pendingUsers,
			href: '/admin/users?emailVerified=false&isShadow=false',
			icon: UserCheck,
		},
	];

	return (
		<section className="rounded-lg border border-gray-500 p-4 shadow-sm sm:p-5">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h2 className="font-semibold text-gray-900 dark:text-gray-100">{translate('admin.needsAttention')}</h2>
					<p className="text-sm text-gray-500">{translate('admin.operationalQueues')}</p>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{attentionItems.map((item) => {
					const Icon = item.icon;

					return (
						<Link
							key={item.label}
							href={localizePath(item.href, locale)}
							className="hover:border-primary flex items-center justify-between rounded-md border border-gray-500 p-4 transition"
						>
							<div className="flex items-center gap-3">
								<Icon className="h-5 w-5 text-gray-500" />
								<span className="text-sm font-medium">{item.label}</span>
							</div>
							<span className="text-xl font-bold">{item.value.toLocaleString()}</span>
						</Link>
					);
				})}
			</div>
		</section>
	);
}
