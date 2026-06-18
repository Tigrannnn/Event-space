import LoadingSpinner from '@/components/ui/loaders/LoadingSpinner';
import PageState from '@/components/ui/PageState';

export default function Loading() {
	return (
		<PageState>
			<LoadingSpinner />
		</PageState>
	);
}
