import type { DashboardStats } from '@event-space/shared';
import { getPercent } from '../DashboardUtils';

interface PlatformMixProps {
	stats: DashboardStats;
}

export default function PlatformMix({ stats }: PlatformMixProps) {
	const bookingStatusTotal =
		stats.confirmedBookings + stats.pendingBookings + stats.cancelledBookings;
	const eventStatusTotal =
		stats.events.published + stats.events.draft + stats.events.cancelled;

	return (
		<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
			<h2 className="font-semibold text-gray-900 dark:text-gray-100">Platform mix</h2>
			<p className="mb-5 text-sm text-gray-500">Status distribution across events and bookings</p>

			<div className="space-y-5">
				<StatusBars
					title="Booking status"
					total={bookingStatusTotal}
					items={[
						{ label: 'Confirmed', value: stats.confirmedBookings },
						{ label: 'Pending', value: stats.pendingBookings },
						{ label: 'Cancelled', value: stats.cancelledBookings },
					]}
				/>
				<StatusBars
					title="Event status"
					total={eventStatusTotal}
					items={[
						{ label: 'Published', value: stats.events.published },
						{ label: 'Draft', value: stats.events.draft },
						{ label: 'Cancelled', value: stats.events.cancelled },
					]}
				/>
			</div>
		</section>
	);
}

function StatusBars({
	title,
	total,
	items,
}: {
	title: string;
	total: number;
	items: Array<{ label: string; value: number }>;
}) {
	return (
		<div>
			<div className="mb-3 flex items-center justify-between">
				<p className="text-sm font-semibold">{title}</p>
				<p className="text-sm text-gray-500">{total.toLocaleString()} total</p>
			</div>
			<div className="space-y-2">
				{items.map((item) => (
					<div key={item.label}>
						<div className="mb-1 flex items-center justify-between text-sm">
							<span className="text-gray-500">{item.label}</span>
							<span className="font-medium">{item.value.toLocaleString()}</span>
						</div>
						<div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
							<div
								className="bg-primary h-full rounded-full"
								style={{ width: `${getPercent(item.value, total)}%` }}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
