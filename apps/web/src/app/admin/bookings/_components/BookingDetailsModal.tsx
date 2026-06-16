'use client';

import Image from 'next/image';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import { useModalStore, useModalData } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import { formatDateTime } from '@/utils/date';
import { Copy } from 'lucide-react';
import { useToastStore, ToastType } from '@/stores/toastStore';

function formatCurrency(value: number | string) {
	return new Intl.NumberFormat('en', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(Number(value));
}

export default function BookingDetailsModal() {
	const { closeModal } = useModalStore();
	const { addToast } = useToastStore();
	const modalData = useModalData(ModalType.BookingDetails);
	const booking = modalData?.booking;
	const event = booking?.event;
	

	if (!booking || !event) {
		return null;
	}

	const adjustments = booking.adjustments ?? [];
	const eventImages = event?.images ?? [];
	const totalAmount = event ? Number(event.price) * booking.quantity : 0;

	const handleCopyId = () => {
		navigator.clipboard.writeText(booking.id);
		addToast('Booking ID copied to clipboard', ToastType.SUCCESS);
	};

	return (
		<Modal onClose={closeModal} size="xl" ariaLabel="Booking details">
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50">
				<ModalHeader title="Booking details" onClose={closeModal} />

				<div className="grid gap-6">
					<div className="space-y-6">
						<section className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-950">
							<p className="text-sm font-semibold tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
								Customer
							</p>
							<div className="mt-4 space-y-1">
								<p className="text-lg font-semibold text-gray-900 dark:text-white">
									{booking.user?.name ?? 'Unknown customer'}
								</p>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									{booking.user?.email ?? 'No email'}
								</p>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									Booked {formatDateTime(booking.createdAt)}
								</p>
							</div>
						</section>

						<section className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-950">
							<p className="text-sm font-semibold tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
								Booking summary
							</p>
							<div className="mt-4 flex items-center gap-2 rounded-2xl bg-gray-100 p-3 dark:bg-gray-800">
								<code className="flex-1 font-mono text-xs break-all text-gray-700 dark:text-gray-300">
									{booking.id}
								</code>
								<button
									type="button"
									onClick={handleCopyId}
									className="shrink-0 cursor-pointer rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
									title="Copy ID"
								>
									<Copy className="h-4 w-4" />
								</button>
							</div>
							<div className="mt-3 grid gap-3 text-sm text-gray-700 sm:grid-cols-2 dark:text-gray-200">
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										Status
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">{booking.status}</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										Quantity
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">{booking.quantity}</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										Event price
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{event ? formatCurrency(event.price) : '—'}
									</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										Booking amount
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{formatCurrency(Number(booking.amount))}
									</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										Created at
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{formatDateTime(booking.createdAt)}
									</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										Updated at
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{formatDateTime(booking.updatedAt)}
									</p>
								</div>
							</div>
						</section>

						{adjustments.length > 0 && (
							<section className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-950">
								<p className="text-sm font-semibold tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
									Adjustments
								</p>
								<div className="mt-4 space-y-3">
									{adjustments.map((adjustment) => (
										<div
											key={adjustment.id}
											className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
										>
											<div className="flex flex-wrap items-center justify-between gap-3">
												<div>
													<p className="text-sm font-semibold text-gray-900 dark:text-white">
														{adjustment.type}
													</p>
													<p className="text-sm text-gray-500 dark:text-gray-400">{adjustment.status}</p>
												</div>
												<span className="text-sm font-medium text-gray-900 dark:text-white">
													{formatCurrency(Number(adjustment.amount))}
												</span>
											</div>
											{adjustment.reason && (
												<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{adjustment.reason}</p>
											)}
										</div>
									))}
								</div>
							</section>
						)}
					</div>

					<div className="space-y-6">
						<section className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-950">
							<p className="text-sm font-semibold tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
								Event details
							</p>
							<div className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-200">
								<div>
									<p className="font-semibold text-gray-900 dark:text-white">
										{event?.title ?? 'Unknown event'}
									</p>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										{event?.location ?? 'No location'}
									</p>
								</div>
								<div className="grid gap-3 sm:grid-cols-2">
									<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
										<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
											Date
										</p>
										<p className="mt-1 font-medium text-gray-900 dark:text-white">
											{event ? formatDateTime(event.date) : '—'}
										</p>
									</div>
									<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
										<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
											Duration
										</p>
										<p className="mt-1 font-medium text-gray-900 dark:text-white">
											{event?.duration ? `${event.duration} min` : '—'}
										</p>
									</div>
									<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
										<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
											Difficulty
										</p>
										<p className="mt-1 font-medium text-gray-900 dark:text-white">
											{event?.difficulty ?? '—'}
										</p>
									</div>
									<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
										<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
											Status
										</p>
										<p className="mt-1 font-medium text-gray-900 dark:text-white">{event?.status ?? '—'}</p>
									</div>
								</div>
								{event?.whatsIncluded?.length ? (
									<div>
										<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
											Included
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
								{event?.description && (
									<div>
										<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
											Description
										</p>
										<p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-200">
											{event.description}
										</p>
									</div>
								)}
								{event?.locationUrl && (
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

						{eventImages.length > 0 && (
							<section className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-950">
								<p className="text-sm font-semibold tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
									Event images
								</p>
								<div className="mt-4 grid gap-3 sm:grid-cols-2">
									{eventImages.map((image) => (
										<div
											key={image.id}
											className="overflow-hidden rounded-3xl bg-white shadow-sm dark:bg-gray-900"
										>
											<Image
												width={500}
												height={320}
												alt={event.title ?? 'Event image'}
												src={image.url}
												className="h-44 w-full object-cover"
											/>
										</div>
									))}
								</div>
							</section>
						)}
					</div>
				</div>
			</div>
		</Modal>
	);
}
