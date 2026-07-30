import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import EventsGridSkeleton from '../(home)/_components/EventsGridSkeleton';

export default function FavoritesSkeleton() {
	return (
		<div className="min-h-full max-w-full px-4 py-8">
			<Skeleton className="mb-4 h-8 w-48 rounded" />
			<Skeleton className="mb-6 h-6 w-58 rounded" />
			<EventsGridSkeleton count={8} />
		</div>
	);
}
