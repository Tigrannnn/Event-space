import { Skeleton } from '@/components/ui/Skeleton';

export default function BookingLinkSkeleton() {
	return (
		<div className="mx-auto w-full max-w-xl px-4 py-8">
			<Skeleton className="mb-6 h-9 w-56 rounded" />
			<Skeleton className="h-96 w-full rounded-2xl" />
		</div>
	);
}
