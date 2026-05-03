export default function EventCardSkeleton() {
	return (
		<div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm sm:rounded-4xl md:rounded-[2.5rem]">
			{/* Image skeleton */}
			<div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100 sm:aspect-16/10">
				<div className="absolute top-3 left-3 h-6 w-20 animate-pulse rounded-full bg-gray-200" />
				<div className="h-full w-full animate-pulse bg-gray-200" />
			</div>

			{/* Content skeleton */}
			<div className="p-4 sm:p-6 md:p-8">
				{/* Date badge */}
				<div className="mb-3 flex items-center gap-2">
					<div className="h-2 w-2 animate-pulse rounded-full bg-gray-200" />
					<div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
				</div>

				{/* Title */}
				<div className="mb-3 h-8 w-full animate-pulse rounded bg-gray-200 sm:h-10" />
				<div className="mb-3 h-8 w-2/3 animate-pulse rounded bg-gray-200 sm:h-10" />

				{/* Description */}
				<div className="mb-4 space-y-2">
					<div className="h-4 w-full animate-pulse rounded bg-gray-200" />
					<div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
				</div>

				{/* Location */}
				<div className="mb-4 h-4 w-32 animate-pulse rounded bg-gray-200" />

				{/* Capacity bar */}
				<div className="mb-4 h-3 w-full animate-pulse rounded-full bg-gray-200" />

				{/* Button */}
				<div className="h-12 w-full animate-pulse rounded-xl bg-gray-200" />
			</div>
		</div>
	);
}
