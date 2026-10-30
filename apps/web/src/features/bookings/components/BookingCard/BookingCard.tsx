'use client';

import Link from 'next/link';
import Button from '@/components/ui/Buttons/Button';
import { formatDateTimeZone } from '@/utils/date';
import { formatBookingReference, getBookingStatusBadgeVariant, movedFromDate } from '@/utils/booking';
import { Calendar, CalendarClock, Info, MapPin, Navigation, Plus, QrCode, Users } from 'lucide-react';
import {
	getBookingDisplayStatus,
	getEventCoverImageUrl,
	isEventAvailable,
	getEventTranslation,
	quoteFromBooking,
} from '@event-space/shared';
import CancellationPolicyInfo from '@/components/shared/CancellationPolicyInfo';
import { useConfirm } from '@/hooks/confirmModal';
import { useAcceptReschedule, useCancelBooking } from '../../hooks/useBookings';
import { EventImageWithFallback } from '@/features/events';
import type { BookingWithEstimate } from '@event-space/shared';
import { localizePath, localeIntl } from '@/lib/i18n/config';
import { useTranslation } from '@/hooks/translation';
import { useLabels } from '@/hooks/labels/useLabels';
import { useFormatCurrency } from '@/hooks/format';
import Badge from '@/components/ui/Badge';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { BookingReviewAction } from '@/features/reviews';
import { useModalStore } from '@/stores';
import { ModalType } from '@/stores/modalStore';

interface BookingCardProps {
	booking: BookingWithEstimate;
	/** The link from the booking's email: the card then works for someone with no account. */
	accessToken?: string;
}

function centsToDollars(cents: number) {
	return (cents / 100).toFixed(2);
}

export default function BookingCard({ booking, accessToken }: BookingCardProps) {
	const isGuestView = Boolean(accessToken);
	const { occurrence, quantity, status, refundPercentage, estimatedRefundInCents } = booking;
	const quote = quoteFromBooking(booking);
	const event = occurrence?.event;

	const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking(accessToken);
	const acceptReschedule = useAcceptReschedule(accessToken);
	const { openModal } = useModalStore();
	const formatCurrency = useFormatCurrency();
	const confirm = useConfirm();
	const translate = useTranslation();
	const { BOOKING_STATUS_LABELS } = useLabels();
	const locale = translate.locale;

	if (!occurrence || !event) return null;

	const occurrenceIsAvailable = new Date(occurrence.date) > new Date();
	// Checked-in bookings read as their own status: attended, so neither cancellable nor refundable.
	const displayStatus = getBookingDisplayStatus(booking);
	const occurrenceDate = occurrence.date;
	const movedFrom = status !== 'CANCELLED' ? movedFromDate(booking) : null;
	const walkAwayUntil =
		booking.refundReason === 'RESCHEDULE' && booking.rescheduleRefundUntil
			? new Date(booking.rescheduleRefundUntil)
			: null;
	const awaitingAnswer = Boolean(walkAwayUntil) && !booking.rescheduleAcceptedAt;
	const handledByOrganiser =
		occurrenceIsAvailable &&
		booking.paymentMethod !== 'SITE_PAYMENT' &&
		getBookingDisplayStatus(booking) === 'CONFIRMED';
	const canChangeQuantity =
		occurrenceIsAvailable &&
		booking.paymentMethod === 'SITE_PAYMENT' &&
		getBookingDisplayStatus(booking) === 'CONFIRMED';
	// This booking covers one date; the event may still have others left to book.
	const canBookAnotherDate = isEventAvailable(event);

	const handleBookAnotherDate = () => {
		openModal(ModalType.CreateBooking, { event });
	};

	const canPay =
		occurrenceIsAvailable && booking.paymentMethod === 'SITE_PAYMENT' && status === 'PENDING';

	const handlePay = () => {
		openModal(ModalType.CreateBooking, {
			event,
			selectedOccurrence: occurrence,
			initialQuantity: quantity,
		});
	};

	const handleAcceptDate = async () => {
		const isConfirmed = await confirm({
			title: translate('booking.dateSuitsMe'),
			message: <p>{translate('booking.dateSuitsConfirm')}</p>,
			size: 'sm',
			confirmText: translate('booking.dateSuitsMe'),
			cancelText: translate('booking.close'),
		});

		if (isConfirmed) {
			acceptReschedule.mutate(booking.id);
		}
	};

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
					{!walkAwayUntil && (
						<CancellationPolicyInfo
							eventDate={occurrenceDate ?? ''}
							price={event.price}
							cancellationRules={event.cancellationRules ?? []}
							booking={booking}
						/>
					)}
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
		<div className="group flex h-full flex-col in-data-[skin=soft]:rounded-3xl in-data-[skin=soft]:sm:rounded-3xl in-data-[skin=soft]:p-3 in-data-[skin=listing]:sm:flex-row overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20 in-data-[skin=minimal]:overflow-visible in-data-[skin=minimal]:border-0 in-data-[skin=minimal]:bg-transparent in-data-[skin=minimal]:shadow-none in-data-[skin=listing]:rounded-lg in-data-[skin=listing]:sm:rounded-lg in-data-[skin=listing]:border-gray-200 in-data-[skin=listing]:dark:border-neutral-800 in-data-[skin=listing]:dark:bg-neutral-900 in-data-[skin=listing]:shadow-none in-data-[skin=minimal]:hover:translate-y-0 in-data-[skin=listing]:hover:translate-y-0 in-data-[skin=minimal]:hover:shadow-none in-data-[skin=listing]:hover:shadow-none in-data-[skin=minimal]:dark:bg-transparent in-data-[skin=market]:rounded-2xl in-data-[skin=market]:sm:rounded-2xl in-data-[skin=market]:border-gray-200 in-data-[skin=market]:shadow-none in-data-[skin=market]:hover:translate-y-0 in-data-[skin=market]:hover:shadow-md in-data-[skin=market]:dark:border-neutral-800 in-data-[skin=market]:dark:bg-neutral-900 in-data-[skin=drawer]:rounded-[2rem] in-data-[skin=drawer]:sm:rounded-[2rem] in-data-[skin=drawer]:border-0 in-data-[skin=drawer]:p-3 in-data-[skin=drawer]:shadow-none in-data-[skin=drawer]:hover:translate-y-0 in-data-[skin=drawer]:hover:shadow-lg in-data-[skin=drawer]:dark:bg-neutral-900">
			{/* Event Image */}
			<div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-900 in-data-[skin=minimal]:rounded-2xl in-data-[skin=soft]:rounded-2xl in-data-[skin=drawer]:rounded-3xl in-data-[skin=listing]:sm:aspect-auto in-data-[skin=listing]:sm:w-60 in-data-[skin=listing]:sm:shrink-0">
				<EventImageWithFallback
					src={getEventCoverImageUrl(event) ?? ''}
					alt={eventTranslation.title}
					className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>

				{/* Status Badge */}
				<Badge
					label={BOOKING_STATUS_LABELS[displayStatus]}
					variant={getBookingStatusBadgeVariant(displayStatus)}
					className="absolute top-3 left-3 text-xs font-bold uppercase"
				></Badge>
				{!isGuestView && <FavoriteButton eventId={event.id} className="absolute top-3 right-3" />}
			</div>

			{/* Content */}
			<div className="flex flex-1 flex-col p-4 sm:p-6 in-data-[skin=minimal]:px-0 in-data-[skin=minimal]:sm:px-0 in-data-[skin=soft]:px-2 in-data-[skin=soft]:pb-1 in-data-[skin=soft]:sm:px-2 in-data-[skin=soft]:sm:pb-1 in-data-[skin=drawer]:px-3 in-data-[skin=drawer]:pb-2 in-data-[skin=drawer]:sm:px-3 in-data-[skin=drawer]:sm:pb-2">
				<Link
					href={localizePath(`/events/${event.id}`, locale)}
					className="hover:text-primary dark:hover:text-primary mb-2 line-clamp-2 block min-h-14 text-lg font-bold text-gray-900 transition-colors sm:text-xl dark:text-white in-data-[skin=soft]:text-primary in-data-[skin=soft]:font-(family-name:--font-display) in-data-[skin=minimal]:font-semibold in-data-[skin=listing]:font-semibold in-data-[skin=market]:font-semibold in-data-[skin=drawer]:font-black in-data-[skin=drawer]:tracking-tight"
				>
					{eventTranslation.title}
				</Link>

				<div className="mb-4 flex items-start justify-between gap-3">
					<div>
						<div className="flex items-center gap-2">
							<span className="text-xs font-medium tracking-widest text-gray-500 uppercase dark:text-gray-400">
								{translate('booking.bookingRef')}
							</span>
							<span className="text-primary font-mono text-lg font-bold in-data-[skin=minimal]:text-gray-900 in-data-[skin=listing]:text-gray-900 in-data-[skin=minimal]:dark:text-white in-data-[skin=listing]:dark:text-white in-data-[skin=market]:text-gray-900 in-data-[skin=market]:dark:text-white">
								{formatBookingReference(booking.referenceNumber)}
							</span>
						</div>
						<p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
							{translate('booking.bookingRefTip')}
						</p>
					</div>
					{booking.checkinToken && (
						<button
							type="button"
							onClick={() =>
								openModal(ModalType.BookingQrCode, {
									checkinToken: booking.checkinToken!,
									referenceNumber: booking.referenceNumber,
								})
							}
							aria-label={translate('booking.showQrCode')}
							className="hover:border-primary hover:text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors dark:border-gray-700 dark:text-gray-400"
						>
							<QrCode className="h-4 w-4" />
						</button>
					)}
				</div>

				<div className="mb-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
					<div className="flex items-center gap-2">
						<Calendar className="h-4 w-4" />
						<span>{formatDateTimeZone(occurrenceDate ?? new Date(), localeIntl[locale])}</span>
					</div>

					{movedFrom && (
						<div className="relative z-20 flex items-start gap-2 rounded-xl border border-amber-500 bg-amber-50 p-2.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
							<CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
							<div className="space-y-2">
								<p>
									{translate('booking.dateMoved')}{' '}
									{formatDateTimeZone(movedFrom, localeIntl[locale])}
								</p>
								{awaitingAnswer && walkAwayUntil && (
									<p>
										{translate('booking.dateMovedFullRefund')}{' '}
										{formatDateTimeZone(walkAwayUntil, localeIntl[locale])}
									</p>
								)}
								{booking.rescheduleAcceptedAt && (
									<p className="opacity-80">{translate('booking.dateAccepted')}</p>
								)}
							</div>
						</div>
					)}
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

					<div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
						<Navigation className="h-3.5 w-3.5" />
						{event.meetingLocationUrl ? (
							<a
								href={event.meetingLocationUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-primary relative z-20 cursor-pointer underline underline-offset-2 transition-colors"
							>
								{translate('event.meetingLocationLabel')}: {eventTranslation.meetingLocation}
							</a>
						) : (
							<span>
								{translate('event.meetingLocationLabel')}: {eventTranslation.meetingLocation}
							</span>
						)}
					</div>
				</div>

				{/* Quantity & Price */}
				<div className="mt-auto mb-4 flex items-center justify-between border-t border-b border-gray-100 py-3 dark:border-gray-700 in-data-[skin=soft]:border-dashed in-data-[skin=soft]:border-gray-300 in-data-[skin=soft]:dark:border-gray-600">
					<div className="flex items-center gap-2">
						<Users className="text-primary h-5 w-5" />
						<span className="font-medium text-gray-700 dark:text-gray-300">
							{quantity} {quantity === 1 ? translate('booking.spot') : translate('booking.spots')}
						</span>
					</div>
					<div className="text-right">
						{quote.discountPercent > 0 && (
							<div className="text-sm text-gray-400 line-through dark:text-gray-500">
								{formatCurrency(quote.baseTotal)}
							</div>
						)}
						<span className="text-primary text-xl font-bold in-data-[skin=minimal]:text-gray-900 in-data-[skin=listing]:text-gray-900 in-data-[skin=minimal]:font-semibold in-data-[skin=listing]:font-semibold in-data-[skin=minimal]:dark:text-white in-data-[skin=listing]:dark:text-white in-data-[skin=market]:text-gray-900 in-data-[skin=market]:dark:text-white">{formatCurrency(quote.total)}</span>
						<span className="text-sm text-gray-400 dark:text-gray-500">
							{' '}
							{translate('booking.total')}
						</span>
						{quote.discountPercent > 0 && (
							<div className="text-sm font-semibold text-red-500">
								{translate('event.discountOff', { percent: quote.discountPercent })}
							</div>
						)}

						{/* Refund estimate & commission — only a paid, not yet attended booking can be refunded */}
						{(() => {
							if (displayStatus !== 'CONFIRMED') return null;

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

				{handledByOrganiser && (
					<div className="mb-3 flex items-start gap-2 rounded-xl bg-gray-100 p-2.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
						<Info className="mt-0.5 h-4 w-4 shrink-0" />
						<span>{translate('booking.handledByOrganiser')}</span>
					</div>
				)}

				{/* Actions */}
				<div className="flex flex-col gap-2">
					<BookingReviewAction booking={booking} accessToken={accessToken} />
					{awaitingAnswer ? (
						<>
							{canChangeQuantity && (
								<Button
									variant="secondary"
									size="sm"
									className="w-full"
									onClick={() => openModal(ModalType.ChangeQuantity, { booking, accessToken })}
								>
									{translate('booking.changeQuantity')}
								</Button>
							)}
							<div className="flex gap-2">
								<Button
									size="sm"
									className="flex-1"
									onClick={handleAcceptDate}
									disabled={acceptReschedule.isPending}
								>
									{translate('booking.dateSuitsMe')}
								</Button>
								<Button
									variant="danger"
									size="sm"
									className="flex-1"
									onClick={handleCancel}
									isLoading={isCancelling}
								>
									{translate('booking.dateDoesNotSuit')}
								</Button>
							</div>
						</>
					) : (
						<>
						{occurrenceIsAvailable &&
							booking.paymentMethod === 'SITE_PAYMENT' &&
							displayStatus === 'CONFIRMED' && (
								<Button
									variant="secondary"
									size="sm"
									className="w-full"
									onClick={() => openModal(ModalType.ChangeQuantity, { booking, accessToken })}
								>
									{translate('booking.changeQuantity')}
								</Button>
							)}
						<div className="flex gap-2">
							{/* Link so the event page is prefetched before the click. */}
							<Link href={localizePath(`/events/${event.id}`, locale)} className="flex-1">
								<Button variant={canPay ? 'secondary' : 'primary'} size="sm" className="w-full">
									{translate('booking.viewEvent')}
								</Button>
							</Link>
							{canPay && (
								<Button
									variant="primary"
									size="sm"
									className="flex-1"
									onClick={handlePay}
								>
									{translate('booking.payNow')}
								</Button>
							)}
							{occurrenceIsAvailable &&
								booking.paymentMethod === 'SITE_PAYMENT' &&
								displayStatus === 'CONFIRMED' && (
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
							{canBookAnotherDate && (
								<Button
									variant="primary"
									size="sm"
									className="w-10 shrink-0 px-0"
									onClick={handleBookAnotherDate}
									aria-label={translate('event.bookAnotherSpot')}
									title={translate('event.bookAnotherSpot')}
								>
									<Plus className="h-4 w-4" strokeWidth={2.5} />
								</Button>
							)}
						</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
