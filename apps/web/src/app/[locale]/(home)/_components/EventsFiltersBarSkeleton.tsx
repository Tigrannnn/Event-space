import { Skeleton } from '@/components/ui/Skeleton';

export default function EventsFiltersBarSkeleton() {
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
