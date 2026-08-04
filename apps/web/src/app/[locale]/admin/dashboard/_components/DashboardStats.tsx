'use client';

import type { DashboardStats as DashboardStatsData } from '@event-space/shared';
import { useDashboardFlow, useDashboardSnapshots } from '@/features/admin/hooks/useAdmin';
import { useUrlFilters } from '@/hooks/urlFilters';
import DashboardRangePicker from './DashboardRangePicker';
import FlowKpiCards from './widgets/FlowKpiCards';
import FlowChart from './widgets/FlowChart';
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
 * range picker. State ("how things stand") is frozen daily, because it drifts — a booking
 * confirmed in March and refunded in May is no longer CONFIRMED, so recomputing March today
 * would understate it.
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
	const { data: snapshots, isLoading: areSnapshotsLoading } = useDashboardSnapshots(
		range.from,
		range.to,
		{ enabled: !showLiveState },
	);

	return (
		<div className="space-y-6">
			<DashboardRangePicker range={range} onRangeChange={setRange} />

			<FlowKpiCards flow={flow} isLoading={isFlowLoading} />

			<FlowChart flow={flow} isLoading={isFlowLoading} />

			<NeedsAttention stats={stats} />

			<div className="grid gap-6 xl:grid-cols-2">
				<BookingStateWidget
					stats={stats}
					snapshots={snapshots}
					showLive={showLiveState}
					isLoading={areSnapshotsLoading}
				/>
				<UpcomingEventsList stats={stats} />
			</div>

			<ActivityFeed stats={stats} />
		</div>
	);
}
