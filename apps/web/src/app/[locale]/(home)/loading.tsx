import EventsGridSkeleton from './_components/EventsGridSkeleton';
import EventsFiltersBarSkeleton from './_components/EventsFiltersBarSkeleton';

export default function HomeLoading() {
	return (
		<div className="min-h-full px-4 sm:px-6 lg:px-8">
			<EventsFiltersBarSkeleton />
			<EventsGridSkeleton count={8} />
		</div>
	);
}
