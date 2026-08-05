'use client';

import type { BookingCohort } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { BOOKING_STATUS_COLORS } from '../booking-status-colors';

interface BookingFunnelProps {
	cohort?: BookingCohort;
	isLoading: boolean;
}

const STAGE_COLORS = {
	created: '#6b7280',
	confirmed: BOOKING_STATUS_COLORS.confirmed,
	attended: '#3b82f6',
} as const;

/**
 * The bookings created in the selected period, followed forward through what happened to them.
 *
 * Every stage counts the same cohort, so the stages only ever narrow. The middle one is the
 * reason this widget needs the status history: a booking confirmed in March and cancelled in May
 * still converted in March, but the bookings table now says CANCELLED and would drop it. Counting
 * conversions off current status makes every past period look worse the longer ago it was.
 *
 * The cohort is fixed by `createdAt`, so its membership never changes — only how far through it
 * got. That also makes the first stage equal to the "bookings created" figure above it.
 */
export default function BookingFunnel({ cohort, isLoading }: BookingFunnelProps) {
	const translate = useTranslation();

	if (isLoading || !cohort) {
		return <div className="h-48 animate-pulse rounded-lg border border-gray-500 bg-gray-100 dark:bg-gray-800" />;
	}

	const stages = [
		{ key: 'created', label: translate('admin.funnelCreated'), value: cohort.created },
		{ key: 'confirmed', label: translate('admin.funnelEverConfirmed'), value: cohort.everConfirmed },
		{ key: 'attended', label: translate('admin.funnelAttended'), value: cohort.attended },
	] as const;

	return (
		<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
			<h2 className="font-semibold text-gray-900 dark:text-gray-100">
				{translate('admin.conversionFunnel')}
			</h2>
			<p className="mb-4 text-sm text-gray-500">{translate('admin.conversionFunnelHint')}</p>

			{cohort.created === 0 ? (
				<div className="flex h-32 items-center justify-center">
					<p className="text-sm text-gray-500">{translate('admin.noBookingsForRange')}</p>
				</div>
			) : (
				<div className="space-y-4">
					{stages.map((stage) => {
						const share = Math.round((stage.value / cohort.created) * 100);

						return (
							<div key={stage.key}>
								<div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
									<span className="text-gray-500">{stage.label}</span>
									<span className="text-gray-900 dark:text-gray-100">
										<span className="font-medium">{stage.value.toLocaleString()}</span>
										<span className="ml-2 text-xs text-gray-500">
											{share}% {translate('admin.ofCreated')}
										</span>
									</span>
								</div>
								<div className="h-2.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
									<div
										className="h-full rounded-full"
										style={{ width: `${share}%`, backgroundColor: STAGE_COLORS[stage.key] }}
									/>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</section>
	);
}
