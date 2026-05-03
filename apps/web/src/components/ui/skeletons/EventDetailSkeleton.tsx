export default function EventDetailSkeleton() {
	return (
		<main className="min-h-screen bg-gray-50">
			{/* Hero Skeleton */}
			<section className="relative h-125 w-full animate-pulse bg-gray-200" />

			{/* Content Skeleton */}
			<div className="mx-auto max-w-7xl px-6 py-12">
				<div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
					{/* Left Column */}
					<div className="space-y-8 lg:col-span-2">
						{/* Title */}
						<div className="h-16 animate-pulse rounded-lg bg-gray-200" />

						{/* Stats */}
						<div className="flex gap-6">
							<div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
						</div>

						{/* Info Grid */}
						<div className="grid grid-cols-3 gap-4">
							{[1, 2, 3].map((i) => (
								<div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-200" />
							))}
						</div>

						{/* Description */}
						<div className="space-y-4">
							<div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
							<div className="h-4 w-full animate-pulse rounded bg-gray-200" />
							<div className="h-4 w-full animate-pulse rounded bg-gray-200" />
							<div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
						</div>
					</div>

					{/* Right Column - Booking Card */}
					<div className="lg:col-span-1">
						<div className="h-96 animate-pulse rounded-3xl bg-white p-8 shadow-xl">
							<div className="mb-6 h-12 w-32 animate-pulse rounded bg-gray-200" />
							<div className="mb-2 h-4 w-full animate-pulse rounded bg-gray-200" />
							<div className="mt-8 h-12 w-full animate-pulse rounded bg-gray-200" />
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
