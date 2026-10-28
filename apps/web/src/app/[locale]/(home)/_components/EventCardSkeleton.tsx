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

	if (skin === 'soft') {
		return (
			<div className="rounded-3xl border border-gray-200/70 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
				<Skeleton className="aspect-4/3 w-full rounded-2xl" />
				<div className="space-y-3 px-2 pt-4 pb-1">
					<Skeleton className="h-6 w-4/5 rounded" />
					<Skeleton className="h-4 w-1/2 rounded" />
					<div className="flex items-center justify-between border-t border-dashed border-gray-300 pt-4 dark:border-gray-600">
						<Skeleton className="h-6 w-24 rounded" />
						<Skeleton className="h-11 w-28 rounded-full" />
					</div>
				</div>
			</div>
		);
	}

	if (skin === 'listing') {
		return (
			<div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white sm:flex-row dark:border-neutral-800 dark:bg-neutral-900">
				<Skeleton className="aspect-video w-full rounded-none sm:aspect-auto sm:min-h-52 sm:w-64 lg:w-80" />
				<div className="flex flex-1 flex-col gap-3 p-4">
					<Skeleton className="h-6 w-3/4 rounded" />
					<Skeleton className="h-4 w-1/2 rounded" />
					<Skeleton className="h-4 w-2/5 rounded" />
					<Skeleton className="mt-auto h-5 w-32 rounded" />
				</div>
				<div className="flex flex-col justify-end gap-3 border-t border-gray-200 p-4 sm:w-52 sm:border-t-0 sm:border-l lg:w-60 dark:border-neutral-800">
					<Skeleton className="ml-auto h-7 w-28 rounded" />
					<Skeleton className="h-10 w-full rounded-md" />
				</div>
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
