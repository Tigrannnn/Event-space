'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import { useModalData, useModalStore } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import { Copy } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/clipboard';
import { useTranslation } from '@/hooks/translation';
import {
	getEventTranslation,
	getCategoryTranslation,
	getOccurrenceDisplayState,
	splitOccurrencesByTime,
	type BookingStatusCounts,
	type EventOccurrenceDisplayState,
} from '@event-space/shared';
import { useFormatDate, useFormatCurrency } from '@/hooks/format';
import { useLabels } from '@/hooks/labels/useLabels';
import { useState } from 'react';

/** Confirmed first, then what still might convert, then what no longer counts. */
const BOOKING_STATUS_ORDER = ['CONFIRMED', 'PENDING', 'CANCELLED', 'EXPIRED'] as const;

const STATS_KEY_BY_STATUS = {
	CONFIRMED: 'confirmed',
	PENDING: 'pending',
	CANCELLED: 'cancelled',
	EXPIRED: 'expired',
} as const satisfies Record<(typeof BOOKING_STATUS_ORDER)[number], keyof BookingStatusCounts>;

const STATUS_TEXT_CLASS = {
	CONFIRMED: 'text-emerald-600 dark:text-emerald-400',
	PENDING: 'text-amber-600 dark:text-amber-400',
	CANCELLED: 'text-red-500 dark:text-red-400',
	EXPIRED: 'text-gray-400 dark:text-gray-500',
} as const satisfies Record<(typeof BOOKING_STATUS_ORDER)[number], string>;

const OCCURRENCE_STATE_CLASS = {
	ACTIVE: 'text-emerald-600 dark:text-emerald-400',
	FINISHED: 'text-gray-400 dark:text-gray-500',
	CANCELLED: 'text-red-500 dark:text-red-400',
} as const satisfies Record<EventOccurrenceDisplayState, string>;

function BookingStatusBreakdown({
	stats,
	labels,
	className = '',
}: {
	stats: BookingStatusCounts;
	labels: Record<(typeof BOOKING_STATUS_ORDER)[number], string>;
	className?: string;
}) {
	return (
		<div className={`flex flex-wrap gap-x-3 gap-y-1 ${className}`}>
			{BOOKING_STATUS_ORDER.map((status) => (
				<span key={status} className="text-xs">
					<span className="text-gray-500 dark:text-gray-400">{labels[status]}: </span>
					<span className={`font-semibold ${STATUS_TEXT_CLASS[status]}`}>
						{stats[STATS_KEY_BY_STATUS[status]]}
					</span>
				</span>
			))}
		</div>
	);
}

export default function EventDetailsModal() {
	const translate = useTranslation();
	const locale = translate.locale;
	const router = useRouter();
	const { closeModal } = useModalStore();
	const copyToClipboard = useCopyToClipboard();
	const modalData = useModalData(ModalType.EventDetails);
	const event = modalData?.event;
	const { formatDateTime } = useFormatDate();
	const formatCurrency = useFormatCurrency();
	const {
		BOOKING_STATUS_LABELS,
		EVENT_OCCURRENCE_STATE_LABELS,
		EVENT_STATUS_LABELS,
		EVENT_DIFFICULTY_LABELS,
	} = useLabels();
	const [showPast, setShowPast] = useState(false);

	if (!event) {
		return null;
	}

	const eventTranslation = getEventTranslation(event, locale);
	const categoryTranslation = getCategoryTranslation(event.category, locale);
	const occurrences = event.occurrences ?? [];
	const { upcoming: upcomingOccurrences, past: pastOccurrences } =
		splitOccurrencesByTime(occurrences);

	const renderOccurrence = (occurrence: (typeof occurrences)[number]) => {
		const state = getOccurrenceDisplayState(occurrence);

		return (
			<div
				key={occurrence.id}
				className="rounded-xl border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800"
			>
				<div className="flex items-center justify-between gap-2">
					<p className="text-sm font-medium text-gray-900 dark:text-white">
						{formatDateTime(occurrence.date)}
					</p>
					<span className={`shrink-0 text-xs font-medium ${OCCURRENCE_STATE_CLASS[state]}`}>
						{EVENT_OCCURRENCE_STATE_LABELS[state]}
					</span>
				</div>
				<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
					{translate('admin.seatsSold')}: {occurrence.currentParticipants}/
					{occurrence.maxParticipants} {translate('admin.seats')}
				</p>
				<p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
					{translate('admin.bookingsCount')}: {occurrence.bookingStats?.total ?? 0}
				</p>
				{occurrence.bookingStats && occurrence.bookingStats.total > 0 && (
					<BookingStatusBreakdown
						stats={occurrence.bookingStats}
						labels={BOOKING_STATUS_LABELS}
						className="mt-1"
					/>
				)}
				{occurrence.cancelledAt && (
					<p className="mt-1 text-xs text-red-500">
						{translate('admin.cancelledAt')}: {formatDateTime(occurrence.cancelledAt)}
						{occurrence.cancelReason ? ` — ${occurrence.cancelReason}` : ''}
					</p>
				)}
			</div>
		);
	};
	const totalCapacity = occurrences.reduce((sum, o) => sum + o.maxParticipants, 0);
	const totalBooked = occurrences.reduce((sum, o) => sum + o.currentParticipants, 0);
	const bookingStats = event.bookingStats;

	const handleCopyId = () => {
		void copyToClipboard(event.id, 'admin.copyId');
	};

	const handleCopyOrganizerId = () => {
		if (!event.organizer?.id) return;
		void copyToClipboard(event.organizer.id, 'admin.copyId');
	};

	return (
		<Modal onClose={closeModal} size="xl" ariaLabel={translate('admin.eventDetails')}>
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50">
				<ModalHeader title={translate('admin.eventDetails')} onClose={closeModal} />

				<div className="grid grid-cols-1 gap-6">
					{event.images?.length ? (
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
							{event.images.map((image) => (
								<div
									key={image.id}
									className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 dark:border-gray-700"
								>
									<Image
										src={image.url}
										alt={eventTranslation.title}
										width={600}
										height={400}
										className="h-32 w-full object-cover sm:h-40"
									/>
								</div>
							))}
						</div>
					) : null}

					<section className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-950">
						<p className="text-sm font-semibold tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
							{translate('admin.eventInformation')}
						</p>
						<div className="mt-4 grid grid-cols-1 gap-4 text-sm text-gray-700 dark:text-gray-200">
							<div>
								<button
									type="button"
									onClick={() => {
										closeModal();
										router.push(`/events/${event.id}`);
									}}
									className="text-primary cursor-pointer text-left text-lg font-semibold transition hover:underline"
								>
									{eventTranslation.title}
								</button>
							</div>

							<div className="flex items-center gap-2 rounded-2xl bg-gray-100 p-3 dark:bg-gray-800">
								<code className="flex-1 font-mono text-xs break-all text-gray-700 dark:text-gray-300">
									{event.id}
								</code>
								<button
									type="button"
									onClick={handleCopyId}
									className="shrink-0 cursor-pointer rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
									title="Copy ID"
								>
									<Copy className="h-3 w-3" />
								</button>
							</div>

							<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
								<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.category')}
									</p>
									<button
										type="button"
										onClick={() => {
											closeModal();
											router.push(`/admin/categories?search=${event.category.id}`);
										}}
										className="text-primary mt-1 block text-left font-medium hover:underline"
									>
										{categoryTranslation.name ?? '—'}
									</button>
							</div>

							<div className="grid grid-cols-1 gap-3 sm:grid-cols-1">
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('event.date')}
									</p>
									{/* Only what still needs attention is listed; a year of run tours would
									    otherwise bury the two dates the admin actually came here for. */}
									<div className="mt-2 space-y-2">
										{upcomingOccurrences.length > 0 ? (
											upcomingOccurrences.map(renderOccurrence)
										) : (
											<p className="text-sm text-gray-500 dark:text-gray-400">
												{occurrences.length > 0
													? translate('admin.noUpcomingDates')
													: '—'}
											</p>
										)}

										{pastOccurrences.length > 0 && (
											<>
												<button
													type="button"
													onClick={() => setShowPast((shown) => !shown)}
													className="text-primary cursor-pointer text-xs font-medium hover:underline"
												>
													{showPast
														? translate('admin.hidePastDates')
														: `${translate('admin.pastDates')} (${pastOccurrences.length})`}
												</button>
												{showPast && (
													<div className="space-y-2">{pastOccurrences.map(renderOccurrence)}</div>
												)}
											</>
										)}
									</div>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('event.location')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">{eventTranslation.location}</p>
									{event.locationUrl && (
										<a
											href={event.locationUrl}
											target="_blank"
											rel="noreferrer"
											className="text-primary mt-1 inline-block text-xs font-medium hover:underline"
										>
											{translate('admin.openLocation')}
										</a>
									)}
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.meetingLocation')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">{eventTranslation.meetingLocation}</p>
									{event.meetingLocationUrl && (
										<a
											href={event.meetingLocationUrl}
											target="_blank"
											rel="noreferrer"
											className="text-primary mt-1 inline-block text-xs font-medium hover:underline"
										>
											{translate('admin.openMeetingLocation')}
										</a>
									)}
								</div>
							</div>

							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.price')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{formatCurrency(event.price)}
									</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('event.duration')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{event.duration} {translate('admin.minutesShort')}
									</p>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('event.difficulty')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{event.difficulty ? EVENT_DIFFICULTY_LABELS[event.difficulty] : '—'}
									</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.status')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{EVENT_STATUS_LABELS[event.status] ?? event.status}
									</p>
								</div>
							</div>

							{bookingStats && (
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.totalBookings')}
									</p>
									{bookingStats.total > 0 ? (
										<>
											<p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
												{bookingStats.total}
											</p>
											<BookingStatusBreakdown
												stats={bookingStats}
												labels={BOOKING_STATUS_LABELS}
												className="mt-2"
											/>
										</>
									) : (
										<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
											{translate('admin.noBookingsYet')}
										</p>
									)}
								</div>
							)}

							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.capacity')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{occurrences.length > 0 ? `${totalBooked}/${totalCapacity}` : '—'}
									</p>
									<p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
										{translate('admin.acrossOccurrences')} ({occurrences.length})
									</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.organizer')}
									</p>
									<button
										type="button"
										onClick={() => {
											closeModal();
											router.push(`/admin/users?search=${event.organizer?.id}`);
										}}
										className="text-primary mt-1 block text-left font-medium hover:underline"
									>
										{event.organizer?.name ?? '—'}
									</button>
									{event.organizer?.email && (
										<p className="mt-0.5 text-xs wrap-anywhere text-gray-500 dark:text-gray-400">{event.organizer.email}</p>
									)}
									{event.organizer?.phone && (
										<p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{event.organizer.phone}</p>
									)}
									{event.organizer?.id && (
										<div className="mt-2 flex items-center gap-2 rounded-xl bg-gray-100 p-2 dark:bg-gray-800">
											<code className="flex-1 font-mono text-[0.65rem] break-all text-gray-700 dark:text-gray-300">
												{event.organizer.id}
											</code>
											<button
												type="button"
												onClick={handleCopyOrganizerId}
												className="shrink-0 cursor-pointer rounded px-1.5 py-1 text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
												title="Copy organizer ID"
											>
												<Copy className="h-3 w-3" />
											</button>
										</div>
									)}
								</div>
							</div>

							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.createdAt')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{formatDateTime(event.createdAt)}
									</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.updatedAt')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{formatDateTime(event.updatedAt)}
									</p>
								</div>
							</div>

							{eventTranslation.description && (
								<div>
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.description')}
									</p>
									<p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-200">{eventTranslation.description}</p>
								</div>
							)}

							{eventTranslation.whatsIncluded?.length ? (
								<div>
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.whatIncluded')}
									</p>
									<ul className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2 dark:text-gray-200">
										{eventTranslation.whatsIncluded.map((item) => (
											<li
												key={item}
												className="rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900"
											>
												{item}
											</li>
										))}
									</ul>
								</div>
							) : null}

							{event.cancellationRules?.length ? (
								<div>
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.cancellationRules')}
									</p>
									<ul className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-1 dark:text-gray-200">
										{event.cancellationRules.map((rule) => (
											<li
												key={rule.id}
												className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
											>
												<p className="font-semibold text-gray-900 dark:text-white">
													{translate('admin.expiresHoursBefore')} {rule.hoursBeforeEvent}{' '}
													{translate('cancellation.and')}
												</p>
												<p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
													{translate('admin.refund')}: {rule.refundPercentage}%
												</p>
											</li>
										))}
									</ul>
								</div>
							) : null}
						</div>
					</section>
				</div>
			</div>
		</Modal>
	);
}