'use client';

import Spinner from "@/components/ui/loaders/Spinner";

interface LoadMoreTriggerProps {
	isLoading: boolean;
	isEnabled: boolean;
	loadMoreRef: React.RefObject<HTMLDivElement | null>;
}

export default function LoadMoreTrigger({
	isLoading,
	isEnabled,
	loadMoreRef,
}: LoadMoreTriggerProps) {
	if (!isEnabled) return null;

	return (
		<div
			ref={loadMoreRef}
			className="col-span-full flex h-24 items-center justify-center"
		>
			{isLoading && (
				<Spinner />
			)}
		</div>
	);
}
