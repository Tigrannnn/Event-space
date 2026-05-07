import { Skeleton, SkeletonCard, SkeletonListItem, SkeletonText } from '@/components/ui/Skeleton';

function KpiSkeleton() {
	return (
		<SkeletonCard className="rounded-lg border-gray-500 p-5">
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="mt-3 h-9 w-28" />
					<Skeleton className="mt-3 h-4 w-40" />
				</div>
				<Skeleton className="h-10 w-10 rounded-md" />
			</div>
		</SkeletonCard>
	);
}

function BarGroupSkeleton() {
	return (
		<div>
			<div className="mb-3 flex items-center justify-between">
				<Skeleton className="h-4 w-28" />
				<Skeleton className="h-4 w-16" />
			</div>
			<div className="space-y-3">
				{Array.from({ length: 3 }).map((_, index) => (
					<div key={index}>
						<div className="mb-2 flex items-center justify-between">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-10" />
						</div>
						<Skeleton className="h-2 w-full rounded-full" />
					</div>
				))}
			</div>
		</div>
	);
}

function UpcomingEventSkeleton() {
	return (
		<div className="rounded-md border border-gray-500 p-4">
			<div className="flex items-start justify-between gap-4">
				<SkeletonText className="flex-1" lines={2} widths={['70%', '55%']} />
				<Skeleton className="h-4 w-12" />
			</div>
			<Skeleton className="mt-4 h-2 w-full rounded-full" />
		</div>
	);
}

export default function DashboardSkeleton() {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
				{Array.from({ length: 6 }).map((_, index) => (
					<KpiSkeleton key={index} />
				))}
			</div>

			<div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
				<SkeletonCard className="rounded-lg border-gray-500 p-5">
					<div className="mb-4">
						<Skeleton className="h-5 w-40" />
						<Skeleton className="mt-2 h-4 w-56" />
					</div>
					<div className="grid gap-3 sm:grid-cols-2">
						{Array.from({ length: 4 }).map((_, index) => (
							<div key={index} className="rounded-md border border-gray-500 p-4">
								<div className="flex items-center justify-between gap-4">
									<div className="flex items-center gap-3">
										<Skeleton className="h-5 w-5" />
										<Skeleton className="h-4 w-28" />
									</div>
									<Skeleton className="h-7 w-10" />
								</div>
							</div>
						))}
					</div>
				</SkeletonCard>

				<SkeletonCard className="rounded-lg border-gray-500 p-5">
					<Skeleton className="h-5 w-32" />
					<Skeleton className="mt-2 h-4 w-72 max-w-full" />
					<div className="mt-5 space-y-6">
						<BarGroupSkeleton />
						<BarGroupSkeleton />
					</div>
				</SkeletonCard>
			</div>

			<div className="grid gap-6 xl:grid-cols-2">
				<SkeletonCard className="rounded-lg border-gray-500 p-5">
					<div className="mb-4 flex items-center justify-between">
						<div>
							<Skeleton className="h-5 w-36" />
							<Skeleton className="mt-2 h-4 w-48" />
						</div>
						<Skeleton className="h-4 w-14" />
					</div>
					<div className="space-y-3">
						{Array.from({ length: 3 }).map((_, index) => (
							<UpcomingEventSkeleton key={index} />
						))}
					</div>
				</SkeletonCard>

				<SkeletonCard className="rounded-lg border-gray-500 p-5">
					<Skeleton className="h-5 w-36" />
					<Skeleton className="mt-2 h-4 w-52" />
					<div className="mt-4 space-y-3">
						{Array.from({ length: 5 }).map((_, index) => (
							<div key={index} className="rounded-md border border-gray-500 p-3">
								<SkeletonListItem iconSize="sm" lines={2} />
							</div>
						))}
					</div>
				</SkeletonCard>
			</div>
		</div>
	);
}
