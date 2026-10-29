import { Skeleton } from '@/components/ui/Skeleton';

function EventsFiltersBarSkeletonClassic() {
	return (
		<div className="sticky top-0 z-30 -mx-4 mb-4 border-b border-gray-200/70 bg-gray-50/90 px-4 py-2.5 shadow-sm backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 dark:border-gray-700/70 dark:bg-gray-900/85">
			<div className="flex min-h-11 items-center gap-2 md:hidden">
				<Skeleton className="h-9 flex-1 rounded-full" />
				<Skeleton className="h-9 w-9 shrink-0 rounded-full" />
			</div>

			<div className="hidden min-h-11 items-center gap-3 overflow-x-auto md:flex">
				<Skeleton className="h-9 w-32 shrink-0 rounded-full" />
				<div className="h-6 w-px shrink-0 bg-gray-200 dark:bg-gray-700" />
				<Skeleton className="h-9 w-28 shrink-0 rounded-full" />
				<Skeleton className="h-9 w-24 shrink-0 rounded-full" />
				<Skeleton className="h-9 w-28 shrink-0 rounded-full" />
			</div>
		</div>
	);
}

function EventsFiltersBarSkeletonMinimal() {
	return (
		<div className="-mx-4 mb-4 border-b border-gray-200 bg-white px-4 py-2.5 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 dark:border-neutral-800 dark:bg-neutral-950">
			<div className="flex min-h-11 items-center gap-2 md:hidden">
				<Skeleton className="h-10 flex-1 rounded-full" />
			</div>
			<div className="hidden min-h-11 items-center gap-3 overflow-x-auto md:flex">
				<Skeleton className="h-10 w-28 shrink-0 rounded-full" />
				<Skeleton className="h-10 w-40 shrink-0 rounded-full" />
				<Skeleton className="h-10 w-40 shrink-0 rounded-full" />
				<div className="h-6 w-px shrink-0 bg-gray-200 dark:bg-neutral-800" />
				<Skeleton className="h-10 w-28 shrink-0 rounded-full" />
				<Skeleton className="h-10 w-24 shrink-0 rounded-full" />
				<Skeleton className="h-10 w-28 shrink-0 rounded-full" />
			</div>
		</div>
	);
}

function EventsFiltersBarSkeletonListing() {
	return (
		<div className="-mx-4 mb-4 border-b border-gray-200 bg-white px-4 py-2.5 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 dark:border-neutral-800 dark:bg-neutral-950">
			<div className="mx-auto flex min-h-11 max-w-[1336px] items-center gap-3 overflow-x-auto">
				<Skeleton className="h-10 w-28 shrink-0 rounded-md" />
				<Skeleton className="h-10 w-24 shrink-0 rounded-md" />
				<Skeleton className="h-10 w-32 shrink-0 rounded-md" />
				<Skeleton className="h-10 w-24 shrink-0 rounded-md" />
				<div className="h-6 w-px shrink-0 bg-gray-200 dark:bg-neutral-800" />
				<Skeleton className="h-10 w-28 shrink-0 rounded-md" />
				<Skeleton className="h-10 w-32 shrink-0 rounded-md" />
			</div>
		</div>
	);
}

function EventsFiltersBarSkeletonMarket() {
	return (
		<div className="mx-auto flex max-w-[1400px] gap-2 overflow-hidden px-4 py-3 sm:px-6 lg:px-8">
			{Array.from({ length: 6 }).map((_, index) => (
				<Skeleton key={index} className="h-10 w-28 shrink-0 rounded-xl" />
			))}
		</div>
	);
}

export default function EventsFiltersBarSkeleton() {
	return (
		<>
			<div className="in-data-[skin=listing]:hidden in-data-[skin=minimal]:hidden in-data-[skin=market]:hidden">
				<EventsFiltersBarSkeletonClassic />
			</div>
			<div className="hidden in-data-[skin=minimal]:block">
				<EventsFiltersBarSkeletonMinimal />
			</div>
			<div className="hidden in-data-[skin=listing]:block">
				<EventsFiltersBarSkeletonListing />
			</div>
			<div className="hidden in-data-[skin=market]:block">
				<EventsFiltersBarSkeletonMarket />
			</div>
		</>
	);
}
