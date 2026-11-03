import { Skeleton } from '@/components/ui/Skeleton';

export default function ReviewsSkeletonRows() {
	return (
		<>
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
		</>
	);
}
