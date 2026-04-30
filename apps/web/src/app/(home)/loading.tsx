import EventsGridSkeleton from './_components/EventsGridSkeleton';

export default function HomeLoading() {
	return (
		<div className="min-h-[85vh] px-4 sm:px-6 lg:px-8">
			<EventsGridSkeleton count={8} />
		</div>
	);
}
