import Link from 'next/link';
import { Clock, FileText, CalendarClock, AlertCircle } from 'lucide-react';
import type { DashboardStats } from '@event-space/shared';

interface NeedsAttentionProps {
	stats: DashboardStats;
}

export default function NeedsAttention({ stats }: NeedsAttentionProps) {
	const attentionItems = [
		{
			label: 'Pending bookings',
			value: stats.attention.pendingBookings,
			href: '/admin/bookings',
			icon: Clock,
		},
		{
			label: 'Draft events',
			value: stats.attention.draftEvents,
			href: '/admin/events',
			icon: FileText,
		},
		{
			label: 'Events this week',
			value: stats.attention.eventsThisWeek,
			href: '/admin/events',
			icon: CalendarClock,
		},
		{
			label: 'Events without bookings',
			value: stats.attention.eventsWithNoBookings,
			href: '/admin/events',
			icon: AlertCircle,
		},
	];

	return (
		<section className="rounded-lg border border-gray-500 p-4 shadow-sm sm:p-5">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h2 className="font-semibold text-gray-900 dark:text-gray-100">Needs attention</h2>
					<p className="text-sm text-gray-500">Operational queues to review first</p>
				</div>
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				{attentionItems.map((item) => {
					const Icon = item.icon;

					return (
						<Link
							key={item.label}
							href={item.href}
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
