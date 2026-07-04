'use client';

import Link from 'next/link';
import type { DashboardStats } from '@event-space/shared';
import { formatDate, getPercent } from '../DashboardUtils';
import { useTranslation } from '@/hooks/translation';
import { localizePath } from '@/lib/i18n/config';
import { getEventTranslation } from '@event-space/shared';

interface UpcomingEventsListProps {
	stats: DashboardStats;
}

export default function UpcomingEventsList({ stats }: UpcomingEventsListProps) {
	const translate = useTranslation();
	const locale = translate.locale;
	return (
		<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h2 className="font-semibold text-gray-900 dark:text-gray-100">
						{translate('admin.upcomingEvents')}
					</h2>
					<p className="text-sm text-gray-500">{translate('admin.nextEventsCalendar')}</p>
				</div>
				<Link
					href={localizePath('/admin/events', locale)}
					className="text-primary text-sm font-semibold"
				>
					{translate('admin.viewAll')}
				</Link>
			</div>

			<div className="space-y-3">
				{stats.upcomingEvents.length === 0 && (
					<p className="rounded-md border border-gray-500 p-4 text-sm text-gray-500">
						{translate('admin.noUpcomingEvents')}
					</p>
				)}
				{stats.upcomingEvents.map((event) => {
					const t = getEventTranslation(event, locale);
					return (
						<div key={event.id} className="rounded-md border border-gray-500 p-4">
							<div className="flex items-start justify-between gap-4">
								<div className="min-w-0">
									<p className="truncate font-medium text-gray-900 dark:text-gray-100">{t.title}</p>
									<p className="mt-1 text-sm text-gray-500">
										{formatDate(event.occurrences[0].date)} · {t.location}
									</p>
								</div>
								<p className="text-sm font-semibold">
									{event.occurrences[0].currentParticipants}/{event.occurrences[0].maxParticipants}
								</p>
							</div>
							<div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
								<div
									className="bg-primary h-full rounded-full"
									style={{
										width: `${getPercent(event.occurrences[0].currentParticipants, event.occurrences[0].maxParticipants)}%`,
									}}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
