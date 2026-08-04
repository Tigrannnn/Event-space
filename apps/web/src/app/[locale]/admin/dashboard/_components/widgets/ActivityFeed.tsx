'use client';

import type { ReactNode } from 'react';
import { CalendarPlus, Ticket, UserPlus } from 'lucide-react';
import type { DashboardStats } from '@event-space/shared';
import { getEventTranslation } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { useFormatDate } from '@/hooks/format';
import { useLabels } from '@/hooks/labels/useLabels';

interface ActivityFeedProps {
	stats: DashboardStats;
}

interface ActivityEntry {
	id: string;
	at: Date;
	icon: ReactNode;
	title: string;
	meta: string;
}

/**
 * One feed ordered by time, rather than three lists stacked on top of each other.
 *
 * Previously bookings, users and events were rendered in sequence, each sorted only within
 * itself — so a three-day-old booking could sit above an event created minutes ago, and no row
 * carried a timestamp to make that visible.
 */
export default function ActivityFeed({ stats }: ActivityFeedProps) {
	const translate = useTranslation();
	const locale = translate.locale;
	const { formatRelative } = useFormatDate();
	const { BOOKING_STATUS_LABELS } = useLabels();

	const entries: ActivityEntry[] = [
		...stats.recentBookings.map((booking) => {
			const event = booking.occurrence?.event;
			const eventTitle = event
				? getEventTranslation(event, locale).title
				: translate('booking.unknownEvent');

			return {
				id: `booking-${booking.id}`,
				at: new Date(booking.createdAt),
				icon: <Ticket className="h-4 w-4" />,
				title: `${booking.user?.name || translate('booking.unknownUser')} ${translate('admin.bookedActivity')} ${eventTitle}`,
				meta: `${booking.quantity} ${booking.quantity === 1 ? translate('booking.spot') : translate('booking.spots')} · ${BOOKING_STATUS_LABELS[booking.status]}`,
			};
		}),
		...stats.recentUsers.map((user) => ({
			id: `user-${user.id}`,
			at: new Date(user.createdAt),
			icon: <UserPlus className="h-4 w-4" />,
			title: `${user.name} ${translate('admin.joinedActivity')}`,
			meta: `${user.email ?? translate('booking.noEmail')} · ${user.role}`,
		})),
		...stats.recentEvents.map((event) => ({
			id: `event-${event.id}`,
			at: new Date(event.createdAt),
			icon: <CalendarPlus className="h-4 w-4" />,
			title: `${getEventTranslation(event, locale).title} ${translate('admin.createdActivity')}`,
			meta: event.status,
		})),
	].sort((a, b) => b.at.getTime() - a.at.getTime());

	return (
		<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
			<h2 className="font-semibold text-gray-900 dark:text-gray-100">
				{translate('admin.recentActivity')}
			</h2>
			<p className="mb-4 text-sm text-gray-500">{translate('admin.recentActivityDescription')}</p>

			<div className="space-y-3">
				{entries.length === 0 && (
					<p className="text-sm text-gray-500">{translate('admin.noRecentActivity')}</p>
				)}

				{entries.slice(0, 8).map((entry) => (
					<div
						key={entry.id}
						className="flex items-start gap-3 rounded-md border border-gray-500 p-3"
					>
						<div className="text-primary mt-0.5 shrink-0">{entry.icon}</div>
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
								{entry.title}
							</p>
							<p className="mt-1 truncate text-xs text-gray-500">{entry.meta}</p>
						</div>
						<span className="shrink-0 text-xs whitespace-nowrap text-gray-400">
							{formatRelative(entry.at)}
						</span>
					</div>
				))}
			</div>
		</section>
	);
}
