import { Skeleton } from '@/components/ui/Skeleton';
import ReviewsSkeletonRows from './_components/ReviewsSkeletonRows';

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
			<ReviewsSkeletonRows />
		</div>
	);
}
