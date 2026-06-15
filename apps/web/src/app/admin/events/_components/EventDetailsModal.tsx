'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import { useModalData, useModalStore } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import type { Event } from '@event-space/shared';
import { formatDateTime } from '@/utils/date';

function formatCurrency(value: number | string) {
	return new Intl.NumberFormat('en', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(Number(value));
}

export default function EventDetailsModal() {
	const router = useRouter();
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.EventDetails);
	const event = modalData?.event;

	if (!event) {
		return null;
	}

	return (
		<Modal onClose={closeModal} size="xl" ariaLabel="Event details">
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50">
				<ModalHeader title="Event details" onClose={closeModal} />

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
										alt={event.title}
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
							Event information
						</p>
						<div className="mt-4 grid gap-4 text-sm text-gray-700 dark:text-gray-200">
							<div>
								<button
									type="button"
									onClick={() => {
										closeModal();
										router.push(`/events/${event.id}`);
									}}
									className="text-left text-lg font-semibold text-gray-900 transition hover:underline dark:text-white"
								>
									{event.title}
								</button>
								<p className="text-sm text-gray-500 dark:text-gray-400">{event.category}</p>
							</div>

							<div className="grid gap-3 sm:grid-cols-1">
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										Category
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">{event.category}</p>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										Date
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{formatDateTime(event.date)}
									</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										Location
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">{event.location}</p>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										Price
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{formatCurrency(event.price)}
									</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										Duration
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">{event.duration} min</p>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										Difficulty
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">{event.difficulty}</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										Status
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">{event.status}</p>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										Capacity
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{event.currentParticipants}/{event.maxParticipants}
									</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										Organizer
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">{event.organizer?.name}</p>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										Created at
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{formatDateTime(event.createdAt)}
									</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										Updated at
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{formatDateTime(event.updatedAt)}
									</p>
								</div>
							</div>

							{event.description && (
								<div>
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										Description
									</p>
									<p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-200">
										{event.description}
									</p>
								</div>
							)}

							{event.whatsIncluded?.length ? (
								<div>
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										What's included
									</p>
									<ul className="mt-2 grid gap-2 text-sm text-gray-700 sm:grid-cols-2 dark:text-gray-200">
										{event.whatsIncluded.map((item) => (
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
										Cancellation rules
									</p>
									<ul className="mt-2 grid gap-2 text-sm text-gray-700 sm:grid-cols-1 dark:text-gray-200">
										{event.cancellationRules.map((rule) => (
											<li
												key={rule.id}
												className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
											>
												<p className="font-semibold text-gray-900 dark:text-white">
													Expires {rule.hoursBeforeEvent} hours before
												</p>
												<p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
													Refund: {rule.refundPercentage}%
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
									Open meeting location
								</a>
							)}
						</div>
					</section>
				</div>
			</div>
		</Modal>
	);
}
