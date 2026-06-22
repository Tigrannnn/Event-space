'use client';

import { Clock, DollarSign, Ticket, TrendingUp, Users, CalendarDays } from 'lucide-react';
import type { DashboardStats } from '@event-space/shared';
import { formatCurrency } from '../DashboardUtils';
import { useTranslation } from '@/hooks/translation';

interface KpiCardsProps {
	stats: DashboardStats;
}

export default function KpiCards({ stats }: KpiCardsProps) {
	const translate = useTranslation();
	const kpis = [
		{
			label: translate('admin.bookingValue'),
			value: formatCurrency(stats.totalRevenue),
			hint: `${stats.confirmedBookings.toLocaleString()} ${translate('admin.confirmed')} ${translate('admin.bookings')}`,
			icon: DollarSign,
		},
		{
			label: translate('admin.bookings'),
			value: stats.totalBookings.toLocaleString(),
			hint: `${stats.bookingConfirmationRate}% ${translate('admin.confirmationRate')}`,
			icon: Ticket,
		},
		{
			label: translate('admin.pending'),
			value: stats.pendingBookings.toLocaleString(),
			hint: translate('admin.bookingsWaitingReview'),
			icon: Clock,
		},
		{
			label: translate('admin.users'),
			value: stats.totalUsers.toLocaleString(),
			hint: `${stats.recentUsers.length} ${translate('admin.recentUsers')}`,
			icon: Users,
		},
		{
			label: translate('admin.publishedEvents'),
			value: stats.events.published.toLocaleString(),
			hint: `${stats.events.upcoming.toLocaleString()} ${translate('admin.upcomingEvents')}`,
			icon: CalendarDays,
		},
		{
			label: translate('admin.capacity'),
			value: `${stats.capacityUsageRate}%`,
			hint: `${stats.usedCapacity.toLocaleString()} / ${stats.totalCapacity.toLocaleString()} ${translate('admin.seats')}`,
			icon: TrendingUp,
		},
	];

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
			{kpis.map((card) => {
				const Icon = card.icon;

				return (
					<div key={card.label} className="rounded-lg border border-gray-500 p-4 shadow-sm sm:p-5">
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="text-sm text-gray-500">{card.label}</p>
								<p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
								<p className="mt-2 text-sm text-gray-500">{card.hint}</p>
							</div>
							<div className="rounded-md border border-gray-500 p-2">
								<Icon className="text-primary h-5 w-5" />
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
