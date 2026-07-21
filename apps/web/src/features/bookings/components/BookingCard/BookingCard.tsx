'use client';

import Link from 'next/link';
import Button from '@/components/ui/Buttons/Button';
import { formatDateTime } from '@/utils/date';
import { formatBookingReference } from '@/utils/booking';
import { Calendar, MapPin, Users } from 'lucide-react';
import { getEventCoverImageUrl, isEventAvailable, getEventTranslation } from '@event-space/shared';
import CancellationPolicyInfo from '@/components/shared/CancellationPolicyInfo';
import { useConfirm } from '@/hooks/confirmModal';
import { useCancelBooking } from '../../hooks/useBookings';
import { EventImageWithFallback } from '@/features/events';
import type { BookingWithEstimate } from '@event-space/shared';
import { localizePath, localeIntl } from '@/lib/i18n/config';
import { useTranslation } from '@/hooks/translation';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { useFormatCurrency } from '@/hooks/format';
import Badge from '@/components/ui/Badge';
// import { useModalStore } from '@/stores';
// import { ModalType } from '@/stores/modalStore';

interface BookingCardProps {
	booking: BookingWithEstimate;
}

function centsToDollars(cents: number) {
	return (cents / 100).toFixed(2);
}

export default function BookingCard({ booking }: BookingCardProps) {
	const { occurrence, quantity, status, refundPercentage, estimatedRefundInCents } = booking;
	const event = occurrence?.event;

	const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();
	// const { openModal } = useModalStore();
	const formatCurrency = useFormatCurrency();
	const confirm = useConfirm();
	const translate = useTranslation();
	const locale = translate.locale;
	const navigation = useLocalizedNavigation();

	// const handleUpdate = () => {
	// 	openModal(ModalType.UpdateBooking, { booking });
	// };

	if (!occurrence || !event) return null;

	const occurrenceIsAvailable = new Date(occurrence.date) > new Date();
	const occurrenceDate = occurrence.date;

	const handleCancel = async () => {
		let refundMessage = translate('booking.noRefund');
		if (refundPercentage > 0 && estimatedRefundInCents > 0) {
			refundMessage = `${translate('booking.youWillReceive')}: ~${formatCurrency(centsToDollars(estimatedRefundInCents))}`;
		} else if (refundPercentage > 0 && estimatedRefundInCents === 0) {
			refundMessage = translate('booking.feeCoversAmount');
		}

		const isConfirmed = await confirm({
			title: translate('booking.cancelBooking'),
			message: (
				<div className="space-y-3">
					<p>{`${translate('booking.areYouSure')} ${refundMessage}`}</p>
					<CancellationPolicyInfo
						eventDate={occurrenceDate ?? ''}
						price={event.price}
						cancellationRules={event.cancellationRules ?? []}
						booking={booking}
					/>
				</div>
			),
			size: 'md',
			confirmText: translate('booking.yesCancel'),
			cancelText: translate('booking.close'),
			variant: 'danger',
		});

		if (isConfirmed) {
			cancelBooking(booking.id);
		}
	};

	const eventTranslation = getEventTranslation(event, locale);

	return (
		<div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
			{/* Event Image */}
			<div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
				<EventImageWithFallback
					src={getEventCoverImageUrl(event) ?? ''}
					alt={eventTranslation.title}
					className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>

				{/* Status Badge */}
				<Badge
					label={status}
					variant={status === 'CONFIRMED' ? 'success' : status === 'CANCELLED' ? 'danger' : 'warning'}
					className="absolute top-3 right-3 text-xs font-bold uppercase"
				></Badge>
			</div>

			{/* Content */}
			<div className="p-4 sm:p-6">
				<Link
					href={localizePath(`/events/${event.id}`, locale)}
					className="hover:text-primary dark:hover:text-primary mb-2 line-clamp-2 block text-lg font-bold text-gray-900 transition-colors sm:text-xl dark:text-white"
				>
					{eventTranslation.title}
				</Link>

				<div className="mb-4">
					<div className="flex items-center gap-2">
						<span className="text-xs font-medium tracking-widest text-gray-500 uppercase dark:text-gray-400">
							{translate('booking.bookingRef')}
						</span>
						<span className="text-primary font-mono text-lg font-bold">
							{formatBookingReference(booking.referenceNumber)}
						</span>
					</div>
					<p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
						{translate('booking.bookingRefTip')}
					</p>
				</div>

				<div className="mb-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
					<div className="flex items-center gap-2">
						<Calendar className="h-4 w-4" />
						<span>{formatDateTime(occurrenceDate ?? new Date(), localeIntl[locale])}</span>
					</div>
					<div className="flex items-center gap-2">
						<MapPin className="h-4 w-4" />
						{event.locationUrl ? (
							<a
								href={event.locationUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-primary relative z-20 cursor-pointer text-left underline underline-offset-2 transition-colors"
							>
								{eventTranslation.location}
							</a>
						) : (
							<span>{eventTranslation.location}</span>
						)}
					</div>
				</div>

				{/* Quantity & Price */}
				<div className="mb-4 flex items-center justify-between border-t border-b border-gray-100 py-3 dark:border-gray-700">
					<div className="flex items-center gap-2">
						<Users className="text-primary h-5 w-5" />
						<span className="font-medium text-gray-700 dark:text-gray-300">
							{quantity} {quantity === 1 ? translate('booking.spot') : translate('booking.spots')}
						</span>
					</div>
					<div className="text-right">
						<span className="text-primary text-xl font-bold" suppressHydrationWarning>
							{formatCurrency(event.price, { quantity })}
						</span>
						<span className="text-sm text-gray-400 dark:text-gray-500">
							{' '}
							{translate('booking.total')}
						</span>

						{/* Refund estimate & commission */}
						{(() => {
							if (refundPercentage === 0 || estimatedRefundInCents === 0) {
								return (
									<div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
										{translate('booking.noRefund')}
									</div>
								);
							}

							if (estimatedRefundInCents <= 0) {
								return (
									<div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
										{translate('booking.feeCoversAmount')}
									</div>
								);
							}

							return (
								<div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
									{translate('booking.refund')}: ~{formatCurrency(centsToDollars(estimatedRefundInCents))}
								</div>
							);
						})()}
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-2">
					{/* <Button variant="primary" size="sm" className="flex-1" onClick={handleUpdate}>
						Update
					</Button> */}
					<Button
						variant="primary"
						size="sm"
						className="flex-1"
						onClick={() => navigation.push(`/events/${event.id}`)}
					>
						{translate('booking.viewEvent')}
					</Button>
					{occurrenceIsAvailable && booking.paymentMethod === 'SITE_PAYMENT' && booking.status === 'CONFIRMED' && (
						<Button
							variant="danger"
							size="sm"
							className="flex-1"
							onClick={handleCancel}
							isLoading={isCancelling}
						>
							{translate('booking.cancel')}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
