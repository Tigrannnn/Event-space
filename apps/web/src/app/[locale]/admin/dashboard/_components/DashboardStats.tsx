import type { DashboardStats as DashboardStatsData } from '@event-space/shared';
import KpiCards from './widgets/KpiCards';
import NeedsAttention from './widgets/NeedsAttention';
import PlatformMix from './widgets/PlatformMix';
import UpcomingEventsList from './widgets/UpcomingEventsList';
import RecentActivityFeed from './widgets/RecentActivityFeed';

interface DashboardStatsProps {
	stats: DashboardStatsData;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
	return (
		<div className="space-y-6">
			<KpiCards stats={stats} />

			<div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
				<NeedsAttention stats={stats} />
				<PlatformMix stats={stats} />
			</div>

			<div className="grid gap-6 xl:grid-cols-2">
				<UpcomingEventsList stats={stats} />
				<RecentActivityFeed stats={stats} />
			</div>
		</div>
	);
}
