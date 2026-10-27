'use client';

import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { useSkin } from '@/providers/BrandProvider';

export default function EventCardSkeleton() {
	const skin = useSkin();

	if (skin === 'minimal') {
		return (
			<div>
				<Skeleton className="aspect-5/4 w-full rounded-2xl" />
				<Skeleton className="mt-3 h-4 w-3/4 rounded" />
				<Skeleton className="mt-2 h-4 w-1/2 rounded" />
				<Skeleton className="mt-2 h-4 w-2/3 rounded" />
				<Skeleton className="mt-3 h-5 w-1/3 rounded" />
			</div>
		);
	}

	return (
		<SkeletonCard className="overflow-hidden rounded-2xl p-0 sm:rounded-4xl md:rounded-[2.5rem]">
			{/* Image skeleton */}
			<div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100 sm:aspect-16/10 dark:bg-gray-900">
				<Skeleton className="absolute top-3 left-3 h-6 w-20 rounded-full" />
				<Skeleton className="h-full w-full rounded-none" />
			</div>

			{/* Content skeleton */}
			<div className="p-4 sm:p-6 md:p-8">
				{/* Date badge */}
				<div className="mb-3 flex items-center gap-2">
					<Skeleton className="h-2 w-2 rounded-full" />
					<Skeleton className="h-4 w-24 rounded" />
				</div>

				{/* Title */}
				<Skeleton className="mb-3 h-8 w-full rounded sm:h-10" />
				<Skeleton className="mb-3 h-8 w-2/3 rounded sm:h-10" />

				{/* Description */}
				<div className="mb-4 space-y-2">
					<Skeleton className="h-4 w-full rounded" />
					<Skeleton className="h-4 w-3/4 rounded" />
				</div>

				{/* Location */}
				<Skeleton className="mb-4 h-4 w-32 rounded" />

				{/* Capacity bar */}
				<Skeleton className="mb-4 h-3 w-full rounded-full" />

				{/* Button */}
				<Skeleton className="h-12 w-full rounded-xl" />
			</div>
		</SkeletonCard>
	);
}
