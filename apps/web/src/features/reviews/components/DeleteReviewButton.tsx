'use client';

import { Trash2 } from 'lucide-react';
import { useConfirm } from '@/hooks/confirmModal';
import { useTranslation } from '@/hooks/translation';
import { cn } from '@/utils/cn';
import { useDeleteMyReview } from '../hooks/useReviews';

interface DeleteReviewButtonProps {
	bookingId: string;
	token?: string;
	onDeleted?: () => void;
	showLabel?: boolean;
	className?: string;
}

export function DeleteReviewButton({
	bookingId,
	token,
	onDeleted,
	showLabel = true,
	className,
}: DeleteReviewButtonProps) {
	const translate = useTranslation();
	const confirm = useConfirm();
	const deleteReview = useDeleteMyReview(bookingId, token);

	const handleClick = async () => {
		const confirmed = await confirm({
			title: translate('review.deleteTitle'),
			message: translate('review.deleteMessage'),
			confirmText: translate('review.deleteConfirm'),
			variant: 'danger',
		});

		if (confirmed) {
			deleteReview.mutate(undefined, { onSuccess: () => onDeleted?.() });
		}
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={deleteReview.isPending}
			aria-label={translate('review.deleteAction')}
			title={translate('review.deleteAction')}
			className={cn(
				'relative z-20 flex cursor-pointer items-center gap-1 text-xs font-semibold text-red-500 transition-colors hover:text-red-600 disabled:opacity-50 dark:text-red-400',
				className,
			)}
		>
			<Trash2 className="size-3.5" />
			{showLabel && translate('review.deleteAction')}
		</button>
	);
}
