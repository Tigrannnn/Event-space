import EventCardSkeleton from './EventCardSkeleton';

export default function EventsGridSkeleton({ count = 8 }: { count?: number }) {
	return (
		<div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2 sm:gap-6 sm:py-6 lg:grid-cols-3 lg:gap-8 2xl:grid-cols-4">
			{Array.from({ length: count }).map((_, i) => (
				<EventCardSkeleton key={i} />
			))}
		</div>
	);
}
