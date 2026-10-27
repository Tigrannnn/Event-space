import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
	return (
		<div className="overflow-hidden rounded-lg border border-gray-500 shadow-sm">
			<div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-4">
				<div className="space-y-2">
					<Skeleton className="h-5 w-40 rounded" />
					<Skeleton className="h-4 w-56 max-w-full rounded" />
				</div>
				<Skeleton className="h-9 w-24 shrink-0 rounded-lg sm:w-44" />
			</div>
			{[1, 2, 3].map((item) => (
				<div key={item} className="flex items-center gap-4 border-t border-gray-500 px-3 py-4 sm:px-5">
					<Skeleton className="h-16 w-28 shrink-0 rounded-lg" />
					<div className="w-full space-y-2">
						<Skeleton className="h-4 w-1/3 rounded" />
						<Skeleton className="h-3.5 w-1/2 rounded" />
					</div>
					<Skeleton className="h-9 w-24 shrink-0 rounded-lg" />
				</div>
			))}
		</div>
	);
}
