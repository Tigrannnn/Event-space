import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export default function BookingsSkeleton() {
	return (
		<div className="max-w-full px-4 py-8">
			{/* Header */}
			<Skeleton className="mb-6 h-10 w-48 rounded" />

			{/* Grid */}
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<SkeletonCard key={i} className="overflow-hidden rounded-2xl p-0 sm:rounded-3xl">
						{/* Image skeleton */}
						<Skeleton className="aspect-video w-full rounded-none" />

						{/* Content skeleton */}
						<div className="p-4 sm:p-6">
							{/* Title */}
							<Skeleton className="mb-2 h-6 w-full rounded" />
							<Skeleton className="mb-4 h-6 w-2/3 rounded" />

							{/* Info lines */}
							<div className="mb-4 space-y-2">
								<Skeleton className="h-4 w-full rounded" />
								<Skeleton className="h-4 w-3/4 rounded" />
							</div>

							{/* Price & Quantity */}
							<div className="mb-4 flex items-center justify-between border-t border-b border-gray-100 py-3 dark:border-gray-700">
								<Skeleton className="h-5 w-24 rounded" />
								<Skeleton className="h-6 w-16 rounded" />
							</div>

							{/* Buttons */}
							<div className="flex gap-2">
								<Skeleton className="h-9 flex-1 rounded-lg" />
								<Skeleton className="h-9 flex-1 rounded-lg" />
							</div>
						</div>
					</SkeletonCard>
				))}
			</div>
		</div>
	);
}
