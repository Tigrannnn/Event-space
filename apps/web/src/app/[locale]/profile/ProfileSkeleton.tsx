import { Skeleton, SkeletonAvatar, SkeletonCard, SkeletonListItem } from '@/components/ui/Skeleton';

function ProfileSkeletonClassic() {
	return (
		<div className="min-h-full">
			{/* Header */}
			<div className="bg-white shadow-sm dark:bg-gray-800">
				<div className="mx-auto max-w-3xl px-4 py-6">
					<div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
						<SkeletonAvatar size="xl" />
						<div className="w-full space-y-2 text-center sm:flex-1 sm:text-left">
							<Skeleton className="h-8 w-48" />
							<Skeleton className="h-5 w-64" />
							<Skeleton className="h-6 w-20 rounded-full" />
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
				{/* Settings */}
				<SkeletonCard className="overflow-hidden p-0">
					<div className="border-b border-gray-100 p-4 dark:border-gray-700">
						<div className="flex items-center gap-2">
							<Skeleton className="h-5 w-5" />
							<Skeleton className="h-6 w-24" />
						</div>
					</div>
					<div className="divide-y divide-gray-100 dark:divide-gray-700">
						<div className="p-4">
							<SkeletonListItem iconSize="md" lines={2} />
						</div>
						<div className="p-4">
							<SkeletonListItem iconSize="md" lines={2} />
						</div>
					</div>
				</SkeletonCard>

				{/* Account Actions */}
				<SkeletonCard className="overflow-hidden p-0">
					<div className="border-b border-gray-100 p-4 dark:border-gray-700">
						<Skeleton className="h-6 w-20" />
					</div>
					<div className="space-y-3 p-4">
						<Skeleton className="h-10 w-full rounded-lg bg-gray-100 dark:bg-gray-700/50" />
						<Skeleton className="h-10 w-full rounded-lg bg-gray-100 dark:bg-gray-700/50" />
					</div>
				</SkeletonCard>
			</div>
		</div>
	);
}

function ProfileSkeletonMinimal() {
	return (
		<div className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:py-14">
			<div className="mb-8 flex items-center gap-4 sm:mb-10 sm:gap-5">
				<Skeleton className="size-16 shrink-0 rounded-full sm:size-20" />
				<div className="w-full space-y-2">
					<Skeleton className="h-8 w-2/3 rounded sm:w-64" />
					<Skeleton className="h-5 w-3/4 rounded sm:w-72" />
				</div>
			</div>
			<div className="divide-y divide-gray-200 border-y border-gray-200 dark:divide-neutral-800 dark:border-neutral-800">
				{[1, 2, 3].map((i) => (
					<div key={i} className="flex items-center gap-4 py-5">
						<Skeleton className="size-6 shrink-0 rounded" />
						<div className="w-full space-y-2">
							<Skeleton className="h-5 w-40 rounded" />
							<Skeleton className="h-4 w-56 max-w-full rounded" />
						</div>
					</div>
				))}
			</div>
			<Skeleton className="mt-8 h-5 w-24 rounded" />
		</div>
	);
}

function ProfileSkeletonListing() {
	return (
		<div>
			<div className="bg-primary/80">
				<div className="mx-auto flex max-w-[1336px] items-center gap-4 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
					<Skeleton className="size-16 shrink-0 rounded-md bg-white/30 sm:size-20" />
					<div className="w-full space-y-2">
						<Skeleton className="h-8 w-2/3 rounded bg-white/30 sm:w-64" />
						<Skeleton className="h-5 w-3/4 rounded bg-white/30 sm:w-72" />
					</div>
				</div>
			</div>
			<div className="mx-auto grid max-w-[1336px] grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
				{[1, 2, 3].map((i) => (
					<Skeleton key={i} className="h-[5.5rem] rounded-lg" />
				))}
			</div>
		</div>
	);
}

function ProfileSkeletonSoft() {
	return (
		<div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
			<div className="flex flex-col items-center gap-5 rounded-[2rem] bg-white p-6 sm:flex-row sm:p-8 dark:bg-gray-800">
				<Skeleton className="size-24 shrink-0 rounded-full" />
				<div className="w-full space-y-3">
					<Skeleton className="h-9 w-2/3 rounded sm:w-72" />
					<Skeleton className="h-6 w-full rounded-full sm:w-96" />
				</div>
			</div>
			<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
				{[1, 2, 3].map((i) => (
					<Skeleton key={i} className="h-24 rounded-3xl" />
				))}
			</div>
		</div>
	);
}

function ProfileSkeletonMarket() {
	return (
		<div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:px-8">
			<Skeleton className="h-56 w-full rounded-2xl" />
			<div className="grid grid-cols-1 content-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
				{Array.from({ length: 3 }).map((_, index) => (
					<Skeleton key={index} className="h-24 w-full rounded-2xl" />
				))}
			</div>
		</div>
	);
}

export default function ProfileSkeleton() {
	return (
		<>
			<div className="in-data-[skin=minimal]:hidden in-data-[skin=listing]:hidden in-data-[skin=soft]:hidden in-data-[skin=market]:hidden">
				<ProfileSkeletonClassic />
			</div>
			<div className="hidden in-data-[skin=minimal]:block">
				<ProfileSkeletonMinimal />
			</div>
			<div className="hidden in-data-[skin=listing]:block">
				<ProfileSkeletonListing />
			</div>
			<div className="hidden in-data-[skin=soft]:block">
				<ProfileSkeletonSoft />
			</div>
			<div className="hidden in-data-[skin=market]:block">
				<ProfileSkeletonMarket />
			</div>
		</>
	);
}
