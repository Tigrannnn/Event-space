'use client';

import Link from 'next/link';
import { Clock, Star } from 'lucide-react';
import { reviewWindow, type BookingWithEstimate } from '@event-space/shared';
import Button from '@/components/ui/Buttons/Button';
import { useTranslation } from '@/hooks/translation';
import { localizePath } from '@/lib/i18n/config';
import { StarRating } from './StarRating';

/**
 * The review corner of a booking card.
 *
 * The window is worked out here rather than asked for: the booking already carries its date,
 * the tour's length and the review itself, and a card that asked the server would mean a dozen
 * requests to draw a dozen buttons.
 */
export function BookingReviewAction({ booking }: { booking: BookingWithEstimate }) {
	const translate = useTranslation();
	const locale = translate.locale;
	const review = booking.review;

	if (reviewWindow(booking) !== 'OPEN') {
		return null;
	}

	if (!review) {
		return (
			<Link href={localizePath(`/bookings/${booking.id}/review`, locale)} className="w-full">
				<Button variant="secondary" size="sm" className="w-full">
					<Star className="h-4 w-4" />
					{translate('review.rateTour')}
				</Button>
			</Link>
		);
	}

	return (
		<div className="flex items-center justify-between gap-2 rounded-xl bg-gray-100 px-3 py-2 dark:bg-gray-800">
			<span className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
				<StarRating value={review.rating} />
				{review.status === 'PENDING' && (
					<span className="flex items-center gap-1">
						<Clock className="h-3.5 w-3.5" />
						{translate('review.onReview')}
					</span>
				)}
				{review.status === 'REJECTED' && (
					<span className="text-red-500">
						{review.rejectReason || translate('review.rejected')}
					</span>
				)}
			</span>

			<Link href={localizePath(`/bookings/${booking.id}/review`, locale)}>
				<Button variant="secondary" size="xs">
					{translate('review.change')}
				</Button>
			</Link>
		</div>
	);
}
