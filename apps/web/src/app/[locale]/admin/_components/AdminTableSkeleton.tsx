import { Skeleton } from '@/components/ui/Skeleton';

interface AdminTableSkeletonProps {
	columns?: number;
	filters?: number;
	rows?: number;
}

/**
 * The shape of every admin list page: one bordered card holding the title with its action, the
 * search, the filters, the table with its header and the pager — so nothing jumps when the real
 * page replaces it.
 */
export default function AdminTableSkeleton({
	columns = 6,
	filters = 6,
	rows = 6,
}: AdminTableSkeletonProps) {
	const cells = Array.from({ length: columns });

	return (
		<div className="overflow-hidden rounded-lg border border-gray-500 shadow-sm">
			<div className="flex flex-col gap-4 px-3 py-3 sm:px-5 sm:py-4">
				<div className="flex items-center justify-between gap-3">
					<div className="space-y-2">
						<Skeleton className="h-5 w-40 rounded" />
						<Skeleton className="h-4 w-56 max-w-full rounded" />
					</div>
					<Skeleton className="h-9 w-24 shrink-0 rounded-lg sm:w-44" />
				</div>

				<div className="flex gap-2">
					<Skeleton className="h-9 flex-1 rounded-xl" />
					<Skeleton className="h-9 w-16 rounded-xl sm:w-20" />
				</div>

				<div className="hidden flex-wrap gap-2 md:flex">
					{Array.from({ length: filters }).map((_, index) => (
						<Skeleton key={index} className="h-9 w-32 rounded-xl lg:w-36" />
					))}
				</div>
				<Skeleton className="h-9 w-full rounded-xl md:hidden" />

				<Skeleton className="h-3.5 w-64 max-w-full rounded" />
			</div>

			<div className="border-t border-gray-500 px-3 py-3 sm:px-5">
				<div className="flex gap-6">
					{cells.map((_, index) => (
						<Skeleton
							key={index}
							className={`h-4 rounded ${index === 0 ? 'w-1/4 sm:w-1/3' : 'hidden w-20 sm:block sm:flex-1'}`}
						/>
					))}
				</div>
			</div>

			{Array.from({ length: rows }).map((_, row) => (
				<div key={row} className="border-t border-gray-500 px-3 py-4 sm:px-5">
					<div className="flex items-center gap-6">
						{cells.map((_, index) => (
							<div
								key={index}
								className={`space-y-2 ${index === 0 ? 'w-1/2 sm:w-1/3' : 'hidden sm:block sm:flex-1'}`}
							>
								<Skeleton className="h-4 w-full max-w-[14rem] rounded" />
								{index < 3 && <Skeleton className="h-3.5 w-2/3 rounded" />}
							</div>
						))}
					</div>
				</div>
			))}

			<div className="flex items-center justify-between border-t border-gray-500 px-3 py-3 sm:px-5">
				<Skeleton className="h-4 w-16 rounded" />
				<div className="flex gap-2">
					<Skeleton className="h-9 w-24 rounded-full" />
					<Skeleton className="h-9 w-20 rounded-full" />
				</div>
			</div>
		</div>
	);
}
