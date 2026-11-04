import { Skeleton, SkeletonCard, SkeletonListItem, SkeletonText } from '@/components/ui/Skeleton';

function SmallKpiSkeleton() {
	return (
		<SkeletonCard className="rounded-lg border-gray-500 p-5">
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="mt-3 h-9 w-48 max-w-full" />
					<Skeleton className="mt-3 h-4 w-40" />
					<Skeleton className="mt-2 h-4 w-52 max-w-full" />
				</div>
				<Skeleton className="h-10 w-10 rounded-md" />
			</div>
		</SkeletonCard>
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
			<div className="flex items-center gap-2">
				<Skeleton className="size-2 rounded-full" />
				<Skeleton className="h-3 w-36" />
			</div>

			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<Skeleton className="h-6 w-44" />
					<Skeleton className="mt-2 h-4 w-32" />
				</div>
				<Skeleton className="h-10 w-48 rounded-lg" />
			</div>

			<div className="flex gap-2">
				<Skeleton className="h-9 w-24 rounded-md" />
				<Skeleton className="h-9 w-32 rounded-md" />
			</div>

			<Skeleton className="h-4 w-full max-w-xl" />

			<SkeletonCard className="rounded-lg border-gray-500 p-5 sm:p-6">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
					<div>
						<Skeleton className="h-4 w-28" />
						<Skeleton className="mt-3 h-10 w-64 max-w-full" />
						<Skeleton className="mt-3 h-4 w-56 max-w-full" />
						<Skeleton className="mt-2 h-4 w-44" />
					</div>
					<div className="flex gap-3">
						<Skeleton className="h-36 w-full rounded-md lg:w-52" />
						<Skeleton className="h-36 w-full rounded-md lg:w-52" />
					</div>
				</div>
			</SkeletonCard>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<SmallKpiSkeleton />
				<SmallKpiSkeleton />
			</div>

			<SkeletonCard className="rounded-lg border-gray-500 p-5 sm:p-6">
				<Skeleton className="h-5 w-40" />
				<Skeleton className="mt-2 h-4 w-full max-w-2xl" />
				<Skeleton className="mt-6 h-72 w-full rounded-md" />
				<div className="mt-4 flex justify-center gap-4">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-4 w-28" />
				</div>
			</SkeletonCard>

			<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
				<SkeletonCard className="rounded-lg border-gray-500 p-5">
					<div className="mb-4">
						<Skeleton className="h-5 w-36" />
						<Skeleton className="mt-2 h-4 w-48" />
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
						{Array.from({ length: 4 }).map((_, index) => (
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
