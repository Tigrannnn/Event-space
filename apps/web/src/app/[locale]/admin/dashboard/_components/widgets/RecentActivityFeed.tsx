'use client';

import type { ReactNode } from 'react';
import { CheckCircle, Ticket, Users } from 'lucide-react';
import type { DashboardStats } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';

interface RecentActivityFeedProps {
	stats: DashboardStats;
}

export default function RecentActivityFeed({ stats }: RecentActivityFeedProps) {
	const translate = useTranslation();
	return (
		<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
			<h2 className="font-semibold text-gray-900 dark:text-gray-100">{translate('admin.recentActivity')}</h2>
			<p className="mb-4 text-sm text-gray-500">{translate('admin.recentActivityDescription')}</p>

			<div className="space-y-3">
				{stats.recentBookings.slice(0, 3).map((booking) => (
					<ActivityRow
						key={booking.id}
						icon={<Ticket className="h-4 w-4" />}
						title={`${booking.user?.name || translate('booking.unknownUser')} ${translate('admin.bookedActivity')} ${booking.event?.title || translate('booking.unknownEvent')}`}
						meta={`${booking.quantity} ${booking.quantity === 1 ? translate('booking.spot') : translate('booking.spots')} · ${booking.status}`}
					/>
				))}
				{stats.recentUsers.slice(0, 2).map((user) => (
					<ActivityRow
						key={user.id}
						icon={<Users className="h-4 w-4" />}
						title={`${user.name} joined`}
						meta={`${user.email} · ${user.role}`}
					/>
				))}
				{stats.recentEvents.slice(0, 2).map((event) => (
					<ActivityRow
						key={event.id}
						icon={<CheckCircle className="h-4 w-4" />}
						title={event.title}
						meta={`${event.status} · ${event.category}`}
					/>
				))}
			</div>
		</section>
	);
}

function ActivityRow({ icon, title, meta }: { icon: ReactNode; title: string; meta: string }) {
	return (
		<div className="flex items-start gap-3 rounded-md border border-gray-500 p-3">
			<div className="text-primary mt-0.5">{icon}</div>
			<div className="min-w-0">
				<p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
				<p className="mt-1 truncate text-xs text-gray-500">{meta}</p>
			</div>
		</div>
	);
}
