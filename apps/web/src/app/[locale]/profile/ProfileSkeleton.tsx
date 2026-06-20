import { Skeleton, SkeletonAvatar, SkeletonCard, SkeletonListItem } from '@/components/ui/Skeleton';

export default function ProfileSkeleton() {
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
