'use client';

import type { DashboardStats as DashboardStatsData } from '@event-space/shared';
import {
	useBookingCohort,
	useBookingState,
	useDashboardFlow,
} from '@/features/admin/hooks/useAdmin';
import { useUrlFilters } from '@/hooks/urlFilters';
import DashboardRangePicker from './DashboardRangePicker';
import FlowKpiCards from './widgets/FlowKpiCards';
import FlowChart from './widgets/FlowChart';
import BookingFunnel from './widgets/BookingFunnel';
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
	const { filters: range, setFilters: setRange } = useUrlFilters({
		parse: parseDashboardRange,
		serialize: serializeDashboardRange,
		empty: defaultDashboardRange,
	});

	const showLiveState = isTodayOnly(range);

	const { data: flow, isLoading: isFlowLoading } = useDashboardFlow(range.from, range.to);
	const { data: bookingState, isLoading: isBookingStateLoading } = useBookingState(
		range.from,
		range.to,
		{ enabled: !showLiveState },
	);
	// Unlike the state series, the cohort is meaningful for a single day too: "of the bookings made
	// today, how many are confirmed already" is a fair question.
	const { data: cohort, isLoading: isCohortLoading } = useBookingCohort(range.from, range.to);

	return (
		<div className="space-y-6">
			<DashboardRangePicker range={range} onRangeChange={setRange} />

			<FlowKpiCards flow={flow} cohort={cohort} isLoading={isFlowLoading} />

			<FlowChart flow={flow} isLoading={isFlowLoading} />

			<BookingFunnel cohort={cohort} isLoading={isCohortLoading} />

			<NeedsAttention stats={stats} />

			<div className="grid gap-6 xl:grid-cols-2">
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
