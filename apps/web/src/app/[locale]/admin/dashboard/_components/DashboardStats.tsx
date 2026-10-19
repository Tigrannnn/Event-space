'use client';

import { useState } from 'react';
import type { DashboardStats as DashboardStatsData } from '@event-space/shared';
import {
	useBookingCohort,
	useBookingState,
	useDashboardFlow,
	useDashboardExpectedTimeline,
	useDashboardRevenue,
} from '@/features/admin/hooks/useAdmin';
import { useUrlFilters } from '@/hooks/urlFilters';
import DashboardRangePicker from './DashboardRangePicker';
import FlowKpiCards, { BookingsCreatedCard } from './widgets/FlowKpiCards';
import FlowChart from './widgets/FlowChart';
import RevenueKpiCards from './widgets/RevenueKpiCards';
import RevenueChart from './widgets/RevenueChart';
import ExpectedTimeline from './widgets/ExpectedTimeline';
import { useTranslation } from '@/hooks/translation';
import BookingStateWidget from './widgets/BookingStateWidget';
import NeedsAttention from './widgets/NeedsAttention';
import UpcomingEventsList from './widgets/UpcomingEventsList';
import ActivityFeed from './widgets/ActivityFeed';
import {
	defaultDashboardRange,
	isTodayOnly,
	parseDashboardRange,
	serializeDashboardRange,
} from './dashboard-range';

interface DashboardStatsProps {
	stats: DashboardStatsData;
}

/**
 * The dashboard splits into two kinds of number.
 *
 * Flow ("what happened over the period") is recomputed live from `createdAt` and follows the
 * range picker. State ("how things stood") comes from the booking status history, which keeps the
 * period each booking spent in each status — so March can be asked about in December and still
 * answer with March's confirmations, not with what is left of them today.
 *
 * Needs Attention and Upcoming Events ignore the range entirely: they are a to-do list for right
 * now, and a booking that needed attention in March has long since been handled.
 */
export default function DashboardStats({ stats }: DashboardStatsProps) {
	const translate = useTranslation();
	const [moneyView, setMoneyView] = useState<'tours' | 'cash'>('tours');
	const { filters: range, setFilters: setRange } = useUrlFilters({
		parse: parseDashboardRange,
		serialize: serializeDashboardRange,
		empty: defaultDashboardRange,
	});

	const showLiveState = isTodayOnly(range);

	const { data: flow, isLoading: isFlowLoading } = useDashboardFlow(range.from, range.to);
	const { data: revenue, isLoading: isRevenueLoading } = useDashboardRevenue(range.from, range.to);
	const { data: timeline, isLoading: isTimelineLoading } = useDashboardExpectedTimeline(
		range.from,
		range.to,
	);
	const { data: bookingState, isLoading: isBookingStateLoading } = useBookingState(
		range.from,
		range.to,
		{ enabled: !showLiveState },
	);
	// Unlike the state series, the cohort is meaningful for a single day too: "of the bookings made
	// today, how many are confirmed already" is a fair question.
	const { data: cohort } = useBookingCohort(range.from, range.to);

	return (
		<div className="space-y-6">
			<DashboardRangePicker range={range} onRangeChange={setRange} />

			<div className="flex gap-2">
				{(['tours', 'cash'] as const).map((view) => (
					<button
						key={view}
						type="button"
						onClick={() => setMoneyView(view)}
						className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm transition-colors ${
							moneyView === view
								? 'border-primary text-primary font-semibold'
								: 'border-gray-500 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
						}`}
					>
						{translate(view === 'tours' ? 'admin.revenueViewTours' : 'admin.revenueViewCash')}
					</button>
				))}
			</div>

			<p className="text-sm text-gray-500">
				{translate(moneyView === 'tours' ? 'admin.revenueViewToursHint' : 'admin.revenueViewCashHint')}
			</p>

			{moneyView === 'tours' ? (
				<>
					<RevenueKpiCards
						revenue={revenue}
						isLoading={isRevenueLoading}
						bookingsCard={<BookingsCreatedCard flow={flow} cohort={cohort} isLoading={isFlowLoading} />}
					/>
					<RevenueChart revenue={revenue} isLoading={isRevenueLoading} />
					<ExpectedTimeline timeline={timeline} isLoading={isTimelineLoading} />
				</>
			) : (
				<>
					<FlowKpiCards flow={flow} cohort={cohort} isLoading={isFlowLoading} />
					<FlowChart flow={flow} isLoading={isFlowLoading} />
				</>
			)}

			<NeedsAttention stats={stats} />

			<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
				<BookingStateWidget
					stats={stats}
					history={bookingState}
					showLive={showLiveState}
					isLoading={isBookingStateLoading}
				/>
				<UpcomingEventsList stats={stats} />
			</div>

			<ActivityFeed stats={stats} />
		</div>
	);
}
