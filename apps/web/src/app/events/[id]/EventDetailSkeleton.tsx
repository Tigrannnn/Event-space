import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export default function EventDetailSkeleton() {
	return (
		<main className="min-h-screen bg-gray-50 dark:bg-gray-900">
			{/* Hero Skeleton */}
			<section className="relative h-125 w-full">
				<Skeleton className="h-full w-full" />
			</section>

			{/* Content Skeleton */}
			<div className="mx-auto max-w-7xl px-6 py-12">
				<div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
					{/* Left Column */}
					<div className="space-y-8 lg:col-span-2">
						{/* Title */}
						<Skeleton className="h-16 rounded-lg" />

						{/* Stats */}
						<div className="flex gap-6">
							<Skeleton className="h-6 w-32 rounded" />
						</div>

						{/* Info Grid */}
						<div className="grid grid-cols-3 gap-4">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-24 rounded-2xl" />
							))}
						</div>

						{/* Description */}
						<div className="space-y-4">
							<Skeleton className="h-8 w-48 rounded" />
							<Skeleton className="h-4 w-full rounded" />
							<Skeleton className="h-4 w-full rounded" />
							<Skeleton className="h-4 w-2/3 rounded" />
						</div>
					</div>

					{/* Right Column - Booking Card */}
					<div className="lg:col-span-1">
						<SkeletonCard className="h-96 rounded-3xl p-8 shadow-xl">
							<Skeleton className="mb-6 h-12 w-32" />
							<Skeleton className="mb-2 h-4 w-full" />
							<Skeleton className="mt-8 h-12 w-full" />
						</SkeletonCard>
					</div>
				</div>
			</div>
		</main>
	);
}
