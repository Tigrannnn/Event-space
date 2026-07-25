'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import { useModalData, useModalStore } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import { Copy } from 'lucide-react';
import { useToastStore, ToastType } from '@/stores/toastStore';
import { useTranslation } from '@/hooks/translation';
import { getEventTranslation, getCategoryTranslation } from '@event-space/shared';
import { useFormatDate, useFormatCurrency } from '@/hooks/format';

export default function EventDetailsModal() {
	const translate = useTranslation();
	const locale = translate.locale;
	const router = useRouter();
	const { closeModal } = useModalStore();
	const { addToast } = useToastStore();
	const modalData = useModalData(ModalType.EventDetails);
	const event = modalData?.event;
	const { formatDateTime } = useFormatDate();
	const formatCurrency = useFormatCurrency();

	if (!event) {
		return null;
	}

	const eventTranslation = getEventTranslation(event, locale);
	const categoryTranslation = getCategoryTranslation(event.category, locale);
	const primaryOccurrence = event.occurrences?.[0];
	const occurrences = event.occurrences ?? [];

	const handleCopyId = () => {
		navigator.clipboard.writeText(event.id);
		addToast(translate('admin.copyId'), ToastType.SUCCESS);
	};

	return (
		<Modal onClose={closeModal} size="xl" ariaLabel={translate('admin.eventDetails')}>
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50">
				<ModalHeader title={translate('admin.eventDetails')} onClose={closeModal} />

				<div className="grid gap-6">
					{event.images?.length ? (
						<div className="grid gap-3 sm:grid-cols-2">
							{event.images.slice(0, 2).map((image) => (
								<div
									key={image.id}
									className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 dark:border-gray-700"
								>
									<Image
										src={image.url}
										alt={eventTranslation.title}
										width={600}
										height={400}
										className="h-48 w-full object-cover"
									/>
								</div>
							))}
						</div>
					) : null}

					<section className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-950">
						<p className="text-sm font-semibold tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
							{translate('admin.eventInformation')}
						</p>
						<div className="mt-4 grid gap-4 text-sm text-gray-700 dark:text-gray-200">
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
								<p className="mt-1 font-medium text-gray-900 dark:text-white">
									{categoryTranslation?.name || '-'}
								</p>
							</div>

							<div className="grid gap-3 sm:grid-cols-1">
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('event.date')}
									</p>
									<div className="mt-2 space-y-2">
										{occurrences.length > 0 ? (
											occurrences.map((occurrence) => (
												<div key={occurrence.id} className="rounded-xl border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
													<p className="text-sm font-medium text-gray-900 dark:text-white">
														{formatDateTime(occurrence.date)}
													</p>
													<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
														{occurrence.currentParticipants}/{occurrence.maxParticipants} {translate('admin.seats')}
													</p>
												</div>
											))
										) : (
											<p className="text-sm text-gray-500 dark:text-gray-400">—</p>
										)}
									</div>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('event.location')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">{eventTranslation.location}</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.meetingLocation')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">{eventTranslation.meetingLocation}</p>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
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
									<p className="mt-1 font-medium text-gray-900 dark:text-white">{event.duration} min</p>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('event.difficulty')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">{event.difficulty}</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.status')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">{event.status}</p>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.capacity')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{primaryOccurrence ? `${primaryOccurrence.currentParticipants}/${primaryOccurrence.maxParticipants}` : '—'}
									</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.organizer')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">{event.organizer?.name}</p>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
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
									<ul className="mt-2 grid gap-2 text-sm text-gray-700 sm:grid-cols-2 dark:text-gray-200">
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
									<ul className="mt-2 grid gap-2 text-sm text-gray-700 sm:grid-cols-1 dark:text-gray-200">
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

							{event.locationUrl && (
								<a
									href={event.locationUrl}
									target="_blank"
									rel="noreferrer"
									className="text-primary text-sm font-medium hover:underline"
								>
									{translate('admin.openMeetingLocation')}
								</a>
							)}
						</div>
					</section>
				</div>
			</div>
		</Modal>
	);
}
