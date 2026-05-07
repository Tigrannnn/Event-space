import { Clock, DollarSign, Ticket, TrendingUp, Users, CalendarDays } from 'lucide-react';
import type { DashboardStats } from '@event-space/shared';
import { formatCurrency } from '../DashboardUtils';

interface KpiCardsProps {
	stats: DashboardStats;
}

export default function KpiCards({ stats }: KpiCardsProps) {
	const kpis = [
		{
			label: 'Revenue',
			value: formatCurrency(stats.totalRevenue),
			hint: `${stats.confirmedBookings.toLocaleString()} confirmed bookings`,
			icon: DollarSign,
		},
		{
			label: 'Bookings',
			value: stats.totalBookings.toLocaleString(),
			hint: `${stats.bookingConfirmationRate}% confirmation rate`,
			icon: Ticket,
		},
		{
			label: 'Pending',
			value: stats.pendingBookings.toLocaleString(),
			hint: 'Bookings waiting for review',
			icon: Clock,
		},
		{
			label: 'Users',
			value: stats.totalUsers.toLocaleString(),
			hint: `${stats.recentUsers.length} recent accounts visible`,
			icon: Users,
		},
		{
			label: 'Published Events',
			value: stats.events.published.toLocaleString(),
			hint: `${stats.events.upcoming.toLocaleString()} upcoming events`,
			icon: CalendarDays,
		},
		{
			label: 'Capacity',
			value: `${stats.capacityUsageRate}%`,
			hint: `${stats.usedCapacity.toLocaleString()} / ${stats.totalCapacity.toLocaleString()} seats`,
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
