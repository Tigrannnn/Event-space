'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import Button from '@/components/ui/Buttons/Button';
import { useTranslation } from '@/hooks/translation';
import { localizePath } from '@/lib/i18n/config';
import { useEventReviews } from '../hooks/useReviews';

/**
 * The call to write a review, at the foot of a tour page. It shows only when the visitor has a
 * booking on this tour whose review window is open and which has no review yet — the same
 * condition as the "rate the tour" button on a booking card, answered by the reviews request
 * the page already makes.
 */
export function WriteReviewButton({ eventId }: { eventId: string }) {
	const translate = useTranslation();
	const { data } = useEventReviews(eventId);
	const bookingId = data?.pages[0]?.reviewableBookingId;

	if (!bookingId) {
		return null;
	}

	return (
		<div className="flex justify-center">
			<Link href={localizePath(`/bookings/${bookingId}/review`, translate.locale)}>
				<Button variant="primary" className="px-8">
					<Star className="size-4" />
					{translate('review.writeReview')}
				</Button>
			</Link>
		</div>
	);
}
