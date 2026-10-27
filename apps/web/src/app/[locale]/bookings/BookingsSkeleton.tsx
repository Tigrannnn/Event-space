import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

function BookingsSkeletonClassic() {
	return (
		<div className="min-h-full max-w-full px-4 py-8">
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

function BookingsSkeletonMinimal() {
	return (
		<div className="min-h-full max-w-full px-4 py-8">
			<Skeleton className="mb-6 h-10 w-48 rounded" />
			<div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<div key={i}>
						<Skeleton className="aspect-video w-full rounded-2xl" />
						<Skeleton className="mt-3 h-6 w-4/5 rounded" />
						<Skeleton className="mt-2 h-4 w-1/2 rounded" />
						<Skeleton className="mt-2 h-4 w-2/3 rounded" />
						<div className="mt-4 flex gap-2">
							<Skeleton className="h-10 flex-1 rounded-full" />
							<Skeleton className="h-10 flex-1 rounded-full" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function BookingsSkeletonListing() {
	return (
		<div className="mx-auto min-h-full w-full max-w-[1336px] px-4 py-6 sm:px-6 lg:px-8">
			<Skeleton className="mb-6 h-10 w-48 rounded" />
			<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className="flex flex-col overflow-hidden rounded-lg border border-gray-200 sm:flex-row dark:border-neutral-800"
					>
						<Skeleton className="aspect-video w-full rounded-none sm:aspect-auto sm:min-h-56 sm:w-60" />
						<div className="flex-1 space-y-3 p-4">
							<Skeleton className="h-6 w-4/5 rounded" />
							<Skeleton className="h-4 w-1/2 rounded" />
							<Skeleton className="h-4 w-2/3 rounded" />
							<Skeleton className="h-10 w-full rounded-md" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default function BookingsSkeleton() {
	return (
		<>
			<div className="in-data-[skin=minimal]:hidden in-data-[skin=listing]:hidden">
				<BookingsSkeletonClassic />
			</div>
			<div className="hidden in-data-[skin=minimal]:block">
				<BookingsSkeletonMinimal />
			</div>
			<div className="hidden in-data-[skin=listing]:block">
				<BookingsSkeletonListing />
			</div>
		</>
	);
}
