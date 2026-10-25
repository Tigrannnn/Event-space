import { Skeleton } from '@/components/ui/Skeleton';

/**
 * The shape of the form while it loads.
 *
 * The page used to show the full-screen brand splash here, which reads as "the whole app is
 * starting again" for what is one small request.
 */
export default function ReviewFormSkeleton() {
	return (
		<div className="mx-auto w-full max-w-2xl px-4 py-10">
			<Skeleton className="h-8 w-64" />
			<Skeleton className="mt-3 h-5 w-80" />

			<div className="mt-8 space-y-6">
				<div className="space-y-2">
					<Skeleton className="h-4 w-28" />
					<div className="flex gap-2">
						{[1, 2, 3, 4, 5].map((star) => (
							<Skeleton key={star} className="h-11 w-11 rounded-full" />
						))}
					</div>
				</div>

				<div className="space-y-2">
					<Skeleton className="h-4 w-40" />
					<Skeleton className="h-36 w-full rounded-xl" />
				</div>

				<div className="flex justify-end gap-3">
					<Skeleton className="h-10 w-28 rounded-xl" />
					<Skeleton className="h-10 w-32 rounded-xl" />
				</div>
			</div>
		</div>
	);
}
