import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

interface AdminTableSkeletonProps {
	rows?: number;
}

export default function AdminTableSkeleton({ rows = 8 }: AdminTableSkeletonProps) {
	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center gap-3">
				<Skeleton className="h-10 w-64 rounded-md" />
				<Skeleton className="h-10 w-32 rounded-md" />
				<Skeleton className="ml-auto h-10 w-36 rounded-md" />
			</div>
			<SkeletonCard className="rounded-lg border-gray-500 p-4">
				<div className="space-y-4">
					{Array.from({ length: rows }).map((_, index) => (
						<div key={index} className="flex items-center gap-4">
							<Skeleton className="h-5 w-1/4" />
							<Skeleton className="h-5 w-1/4" />
							<Skeleton className="h-5 w-1/6" />
							<Skeleton className="ml-auto h-5 w-16" />
						</div>
					))}
				</div>
			</SkeletonCard>
		</div>
	);
}
