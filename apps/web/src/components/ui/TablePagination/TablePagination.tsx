'use client';

import Button from '@/components/ui/Buttons/Button';
import { useTranslation } from '@/hooks/translation';
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
	const translate = useTranslation();

	return (
		<div
			className={cn(
				'flex flex-col gap-3 border-t border-gray-500 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4',
				className,
			)}
		>
			<p className="text-xs text-gray-500 sm:text-sm">
				Page {currentPage}
				{isLoading ? ` · ${translate('common.updating')}` : ''}
			</p>
			<div className="flex gap-2 sm:justify-end">
				<Button
					type="button"
					size="sm"
					variant="secondary"
					className="max-sm:px-3 max-sm:py-1.5 max-sm:text-xs"
					onClick={onPreviousPage}
					disabled={!canGoPrevious || isLoading}
				>
					Previous
				</Button>
				<Button
					type="button"
					size="sm"
					variant="secondary"
					className="max-sm:px-3 max-sm:py-1.5 max-sm:text-xs"
					onClick={onNextPage}
					disabled={!canGoNext || isLoading}
				>
					Next
				</Button>
			</div>
		</div>
	);
}
