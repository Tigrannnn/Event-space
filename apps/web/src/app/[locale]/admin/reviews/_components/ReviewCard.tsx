'use client';

import { useState } from 'react';
import { Check, MessageSquare, Star, Trash2, X } from 'lucide-react';
import { getEventTranslation, type ReviewStatus } from '@event-space/shared';
import type { AdminReview } from '@/features/admin/api/admin.api';
import Button from '@/components/ui/Buttons/Button';
import { useTranslation } from '@/hooks/translation';
import { useFormatDate } from '@/hooks/format';
import { useConfirm } from '@/hooks/confirmModal';
import {
	useDeleteReview,
	useModerateReview,
	useReplyToReview,
} from '@/features/admin/hooks/useAdmin';
import { cn } from '@/utils/cn';

const STATUS_STYLE: Record<ReviewStatus, string> = {
	PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
	PUBLISHED: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
	REJECTED: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
};

const fieldClassName =
	'focus:border-primary w-full rounded-md border border-gray-500 bg-transparent px-3 py-2 text-sm text-gray-900 outline-none dark:text-gray-100';

export default function ReviewCard({ review }: { review: AdminReview }) {
	const translate = useTranslation();
	const { formatDateTime } = useFormatDate();
	const confirm = useConfirm();

	const moderate = useModerateReview();
	const reply = useReplyToReview();
	const deleteReview = useDeleteReview();

	const [rejectReason, setRejectReason] = useState('');
	const [replyText, setReplyText] = useState(review.adminReply ?? '');
	const [isReplyOpen, setIsReplyOpen] = useState(false);

	const eventTitle = review.event
		? getEventTranslation({ translations: review.event.translations }, translate.locale).title
		: '';

	const statusLabel: Record<ReviewStatus, string> = {
		PENDING: translate('admin.reviewsQueue'),
		PUBLISHED: translate('admin.reviewsPublished'),
		REJECTED: translate('admin.reviewsRejected'),
	};

	const handleDelete = async () => {
		const confirmed = await confirm({
			title: translate('admin.reviewDelete'),
			message: translate('admin.reviewDeleteMessage'),
			confirmText: translate('admin.delete'),
			variant: 'danger',
		});

		if (confirmed) {
			deleteReview.mutate(review.id);
		}
	};

	return (
		<li className="space-y-3 px-3 py-4 sm:px-5">
			<div className="flex flex-wrap items-center gap-2">
				<span className="flex items-center gap-1 font-semibold text-gray-900 dark:text-gray-100">
					<Star className="h-4 w-4 fill-amber-400 text-amber-400" />
					{review.rating}
				</span>
				<span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', STATUS_STYLE[review.status])}>
					{statusLabel[review.status]}
				</span>
				<span className="truncate text-sm text-gray-700 dark:text-gray-300">{eventTitle}</span>
				<span className="text-xs text-gray-500">{formatDateTime(review.createdAt)}</span>
			</div>

			<p className="text-xs text-gray-500">
				{review.user?.name}
				{review.user?.email ? ` · ${review.user.email}` : ''}
				{review.booking?.referenceNumber ? ` · #${review.booking.referenceNumber}` : ''}
			</p>

			{review.text ? (
				<p className="text-sm whitespace-pre-line text-gray-800 dark:text-gray-200">{review.text}</p>
			) : (
				<p className="text-sm text-gray-400 italic">{translate('admin.reviewNoText')}</p>
			)}

			{review.rejectReason && (
				<p className="text-xs text-red-500">{review.rejectReason}</p>
			)}

			{review.adminReply && !isReplyOpen && (
				<p className="rounded-xl bg-gray-100 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
					{review.adminReply}
				</p>
			)}

			{review.status === 'PENDING' && (
				<input
					value={rejectReason}
					onChange={(event) => setRejectReason(event.target.value)}
					placeholder={translate('admin.reviewRejectReason')}
					className={fieldClassName}
					disabled={moderate.isPending}
				/>
			)}

			{isReplyOpen && (
				<div className="space-y-2">
					<textarea
						value={replyText}
						onChange={(event) => setReplyText(event.target.value)}
						rows={3}
						placeholder={translate('admin.reviewReplyPlaceholder')}
						className={fieldClassName}
						disabled={reply.isPending}
					/>
					<Button
						type="button"
						size="xs"
						isLoading={reply.isPending}
						onClick={() =>
							reply.mutate(
								{ id: review.id, data: { reply: replyText } },
								{ onSuccess: () => setIsReplyOpen(false) },
							)
						}
					>
						{translate('admin.reviewReplySave')}
					</Button>
				</div>
			)}

			<div className="flex flex-wrap gap-2">
				{review.status !== 'PUBLISHED' && (
					<Button
						type="button"
						size="xs"
						isLoading={moderate.isPending}
						onClick={() => moderate.mutate({ id: review.id, data: { action: 'PUBLISH' } })}
					>
						<Check className="h-4 w-4" />
						{translate('admin.reviewPublish')}
					</Button>
				)}

				{review.status !== 'REJECTED' && (
					<Button
						type="button"
						size="xs"
						variant="secondary"
						isLoading={moderate.isPending}
						onClick={() =>
							moderate.mutate({
								id: review.id,
								data: { action: 'REJECT', rejectReason: rejectReason || null },
							})
						}
					>
						<X className="h-4 w-4" />
						{translate('admin.reviewReject')}
					</Button>
				)}

				<Button
					type="button"
					size="xs"
					variant="secondary"
					onClick={() => setIsReplyOpen((open) => !open)}
				>
					<MessageSquare className="h-4 w-4" />
					{translate('admin.reviewReply')}
				</Button>

				<Button
					type="button"
					size="xs"
					variant="danger"
					isLoading={deleteReview.isPending}
					onClick={handleDelete}
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>
		</li>
	);
}
