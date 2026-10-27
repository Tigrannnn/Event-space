import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
	return (
		<div className="overflow-hidden rounded-lg border border-gray-500 shadow-sm">
			<div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
				<div className="space-y-2">
					<Skeleton className="h-5 w-40 rounded" />
					<Skeleton className="h-4 w-64 max-w-full rounded" />
				</div>
				<Skeleton className="h-9 w-48 rounded-lg" />
			</div>
			{[1, 2, 3].map((item) => (
				<div key={item} className="space-y-3 border-t border-gray-500 px-3 py-4 sm:px-5">
					<div className="flex items-center gap-2">
						<Skeleton className="h-5 w-12 rounded" />
						<Skeleton className="h-5 w-24 rounded-full" />
						<Skeleton className="h-5 w-48 rounded" />
					</div>
					<Skeleton className="h-4 w-3/4 rounded" />
					<Skeleton className="h-9 w-40 rounded-lg" />
				</div>
			))}
		</div>
	);
}
