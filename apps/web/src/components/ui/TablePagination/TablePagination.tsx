'use client';

import Button from '@/components/ui/Buttons/Button';
import { cn } from '@/utils/cn';

interface TablePaginationProps {
	skip: number;
	limit: number;
	isLoading?: boolean;
	canGoPrevious: boolean;
	canGoNext: boolean;
	onPreviousPage: () => void;
	onNextPage: () => void;
	className?: string;
}

export default function TablePagination({
	skip,
	limit,
	isLoading = false,
	canGoPrevious,
	canGoNext,
	onPreviousPage,
	onNextPage,
	className,
}: TablePaginationProps) {
	const currentPage = Math.floor(skip / limit) + 1;

	return (
		<div
			className={cn('flex items-center justify-between border-t border-gray-500 px-5 py-4', className)}
		>
			<p className="text-sm text-gray-500">
				Page {currentPage}
				{isLoading ? ' · Updating...' : ''}
			</p>
			<div className="flex gap-2">
				<Button
					type="button"
					size="sm"
					variant="secondary"
					onClick={onPreviousPage}
					disabled={!canGoPrevious || isLoading}
				>
					Previous
				</Button>
				<Button
					type="button"
					size="sm"
					variant="secondary"
					onClick={onNextPage}
					disabled={!canGoNext || isLoading}
				>
					Next
				</Button>
			</div>
		</div>
	);
}
