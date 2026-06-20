import { Suspense } from 'react';
import { serverFetch } from '@/lib/server.api';
import type { DashboardStats } from '@event-space/shared';
import DashboardStatsComponent from './_components/DashboardStats';
import DashboardSkeleton from './_components/DashboardSkeleton';

export default async function DashboardPage() {
	const stats = await serverFetch<DashboardStats>('/admin/stats');

	return (
		<div className="space-y-6">
			<Suspense fallback={<DashboardSkeleton />}>
				<DashboardStatsComponent stats={stats} />
			</Suspense>
		</div>
	);
}
