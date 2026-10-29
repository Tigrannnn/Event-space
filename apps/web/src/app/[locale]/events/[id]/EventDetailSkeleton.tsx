import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

function EventDetailSkeletonClassic() {
	return (
		<div className="min-h-full bg-gray-50 dark:bg-gray-900">
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
		</div>
	);
}

function EventDetailSkeletonMinimal() {
	return (
		<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<Skeleton className="mb-4 h-5 w-16 rounded" />
			<Skeleton className="mb-3 h-10 w-2/3 rounded-lg" />
			<Skeleton className="mb-6 h-5 w-1/3 rounded" />
			<Skeleton className="h-64 w-full rounded-2xl sm:h-[30rem]" />
			<div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-16">
				<div className="space-y-4 lg:col-span-2">
					<Skeleton className="h-5 w-56 rounded" />
					<div className="space-y-3 border-t border-gray-200 pt-8 dark:border-neutral-800">
						<Skeleton className="h-6 w-40 rounded" />
						<Skeleton className="h-4 w-full rounded" />
						<Skeleton className="h-4 w-full rounded" />
						<Skeleton className="h-4 w-2/3 rounded" />
					</div>
				</div>
				<div className="space-y-4 rounded-2xl border border-gray-200 p-6 dark:border-neutral-800">
					<Skeleton className="h-8 w-40 rounded" />
					<div className="grid grid-cols-2 gap-2">
						<Skeleton className="h-24 rounded-xl" />
						<Skeleton className="h-24 rounded-xl" />
					</div>
					<Skeleton className="h-12 w-full rounded-full" />
				</div>
			</div>
		</div>
	);
}

function EventDetailSkeletonListing() {
	return (
		<div className="mx-auto max-w-[1200px] px-4 py-5 sm:px-6 lg:px-8">
			<div className="mb-4 flex items-center justify-between">
				<Skeleton className="h-5 w-40 rounded" />
				<Skeleton className="h-9 w-48 rounded-md" />
			</div>
			<Skeleton className="mb-2 h-9 w-2/3 rounded" />
			<Skeleton className="mb-4 h-4 w-1/3 rounded" />
			<Skeleton className="h-64 w-full rounded-lg sm:h-[26rem]" />
			<div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="space-y-5 lg:col-span-2">
					<Skeleton className="h-[4.5rem] w-full rounded-lg" />
					<Skeleton className="h-12 w-full rounded-lg" />
					<div className="space-y-3 rounded-lg border border-gray-200 p-6 dark:border-neutral-800">
						<Skeleton className="h-6 w-40 rounded" />
						<Skeleton className="h-4 w-full rounded" />
						<Skeleton className="h-4 w-full rounded" />
						<Skeleton className="h-4 w-2/3 rounded" />
					</div>
				</div>
				<div className="overflow-hidden rounded-lg border border-gray-300 dark:border-neutral-700">
					<Skeleton className="h-20 w-full rounded-none" />
					<div className="space-y-4 p-5">
						<Skeleton className="h-32 w-full rounded-md" />
						<Skeleton className="h-12 w-full rounded-md" />
					</div>
				</div>
			</div>
		</div>
	);
}

function EventDetailSkeletonMarket() {
	return (
		<div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:px-8">
			<div className="space-y-4">
				<Skeleton className="h-8 w-2/3 rounded" />
				<Skeleton className="h-4 w-1/3 rounded" />
				<Skeleton className="aspect-4/3 w-full rounded-2xl sm:aspect-16/10" />
				<Skeleton className="h-20 w-full rounded-2xl" />
				<Skeleton className="h-48 w-full rounded-2xl" />
			</div>
			<Skeleton className="h-96 w-full rounded-2xl" />
		</div>
	);
}

function EventDetailSkeletonDrawer() {
	return (
		<div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
			<Skeleton className="aspect-4/5 max-h-[38rem] w-full rounded-[2rem] sm:aspect-21/9 sm:rounded-[2.5rem]" />
			<div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
				<div className="space-y-4">
					<div className="flex gap-3">
						<Skeleton className="h-11 w-40 rounded-full" />
						<Skeleton className="h-11 w-40 rounded-full" />
					</div>
					<Skeleton className="h-8 w-48 rounded" />
					<Skeleton className="h-4 w-full rounded" />
					<Skeleton className="h-4 w-11/12 rounded" />
					<Skeleton className="h-4 w-2/3 rounded" />
				</div>
				<Skeleton className="h-96 w-full rounded-[2rem]" />
			</div>
		</div>
	);
}

export default function EventDetailSkeleton() {
	return (
		<>
			<div className="in-data-[skin=listing]:hidden in-data-[skin=minimal]:hidden in-data-[skin=market]:hidden in-data-[skin=drawer]:hidden">
				<EventDetailSkeletonClassic />
			</div>
			<div className="hidden in-data-[skin=minimal]:block">
				<EventDetailSkeletonMinimal />
			</div>
			<div className="hidden in-data-[skin=listing]:block">
				<EventDetailSkeletonListing />
			</div>
			<div className="hidden in-data-[skin=market]:block">
				<EventDetailSkeletonMarket />
			</div>
			<div className="hidden in-data-[skin=drawer]:block">
				<EventDetailSkeletonDrawer />
			</div>
		</>
	);
}
