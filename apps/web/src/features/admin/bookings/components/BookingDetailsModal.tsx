'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button/Button';
import Select from '@/components/ui/Select/Select';
import { useModalStore, useModalData } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import { formatBookingReference } from '@/utils/booking';
import { Copy } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/clipboard';
import { getEventTranslation } from '@event-space/shared';
import { useFormatCurrency, useFormatDate } from '@/hooks/format';
import { useTranslation } from '@/hooks/translation';

export default function BookingDetailsModal() {
	const translate = useTranslation();
	const locale = translate.locale;
	const { formatDateTime } = useFormatDate();
	const formatCurrency = useFormatCurrency();
	const { closeModal } = useModalStore();
	const copyToClipboard = useCopyToClipboard();
	const modalData = useModalData(ModalType.BookingDetails);
	const booking = modalData?.booking;
	const event = booking?.occurrence?.event;
	const [refundType, setRefundType] = useState<'FULL' | 'RULES' | 'MANUAL'>('RULES');
	const [reason, setReason] = useState('');

	if (!booking || !event) {
		return null;
	}

	const t = getEventTranslation(event, locale);
	const adjustments = booking.adjustments ?? [];
	const eventImages = event?.images ?? [];

	const handleCopy = (value: string) => {
		void copyToClipboard(value, 'admin.copyId');
	};

	return (
		<Modal onClose={closeModal} size="xl" ariaLabel="Booking details">
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50">
				<ModalHeader title={translate('admin.bookingDetails')} onClose={closeModal} />

				<div className="grid gap-6">
					<div className="space-y-6">
						<section className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-950">
							<p className="text-sm font-semibold tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
								{translate('admin.customer')}
							</p>
							<div className="mt-4 space-y-1">
								<p className="text-lg font-semibold text-gray-900 dark:text-white">
									{booking.user?.name ?? translate('admin.unknownCustomer')}
								</p>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									{booking.user?.email ?? translate('admin.noEmail')}
								</p>
								{booking.user?.phone && (
									<p className="text-sm text-gray-500 dark:text-gray-400">
										{booking.user.phone}
									</p>
								)}
								<p className="text-sm text-gray-500 dark:text-gray-400">
									{translate('admin.booked')} {formatDateTime(booking.createdAt)}
								</p>
							</div>
						</section>

						<section className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-950">
							<p className="text-sm font-semibold tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
								{translate('admin.bookingSummary')}
							</p>
							<div className="mt-4 flex items-center gap-2 rounded-2xl bg-gray-100 p-3 dark:bg-gray-800">
								<code className="flex-1 font-mono text-xs break-all text-gray-700 dark:text-gray-300">
									{booking.id}
								</code>
								<button
									type="button"
									onClick={() => handleCopy(booking.id)}
									className="shrink-0 cursor-pointer rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
									title="Copy ID"
								>
									<Copy className="h-4 w-4" />
								</button>
							</div>
							<div className="mt-3 grid gap-3 text-sm text-gray-700 sm:grid-cols-2 dark:text-gray-200">
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.reference')}
									</p>
									<p className="text-primary mt-1 font-medium">
										{formatBookingReference(booking.referenceNumber)}
									</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.checkedAt')}
									</p>
									<p className="mt-1 font-medium">
										{booking.checkedInAt ? formatDateTime(booking.checkedInAt) : '—'}
									</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.status')}
									</p>
									<div className="mt-1 flex items-center gap-2">
										<p className="font-medium text-gray-900 dark:text-white">{booking.status}</p>
										{booking.expired && (
											<span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-400">
												{translate('booking.bookingExpired')}
											</span>
										)}
									</div>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.qty')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">{booking.quantity}</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.eventPrice')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{event ? formatCurrency(event.price) : '—'}
									</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.bookingAmount')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{formatCurrency(Number(booking.amount))}
									</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.paymentMethod')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">{booking.paymentMethod}</p>
								</div>
								{booking.createdByAdminId && (
									<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
										<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
											{translate('admin.createdByAdmin')}
										</p>
										<p className="mt-1 font-mono text-xs break-all text-gray-900 dark:text-white">
											{booking.createdByAdminId}
										</p>
									</div>
								)}
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.createdAt')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{formatDateTime(booking.createdAt)}
									</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.updatedAt')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{formatDateTime(booking.updatedAt)}
									</p>
								</div>
							</div>

							{booking.paymentIntentId && (
								<div className="mt-3">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.paymentIntentId')}
									</p>
									<div className="mt-1 flex items-center gap-2 rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
										<code className="flex-1 font-mono text-xs break-all text-gray-700 dark:text-gray-300">
											{booking.paymentIntentId}
										</code>
										<button
											type="button"
											onClick={() => handleCopy(booking.paymentIntentId!)}
											className="shrink-0 cursor-pointer rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
											title="Copy Payment Intent ID"
										>
											<Copy className="h-3.5 w-3.5" />
										</button>
									</div>
								</div>
							)}
						</section>

						{adjustments.length > 0 && (
							<section className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-950">
								<p className="text-sm font-semibold tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
									{translate('admin.adjustments')}
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
													{adjustment.currency.toUpperCase()} {formatCurrency(Number(adjustment.amount))}
												</span>
											</div>

											{adjustment.reason && (
												<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{adjustment.reason}</p>
											)}

											<div className="mt-3 grid gap-2 sm:grid-cols-2">
												<p className="text-xs text-gray-500 dark:text-gray-400">
													{translate('admin.createdAt')}: {formatDateTime(adjustment.createdAt)}
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">
													{translate('admin.updatedAt')}: {formatDateTime(adjustment.updatedAt)}
												</p>
											</div>

											{(adjustment.stripePaymentIntentId || adjustment.stripeRefundId) && (
												<div className="mt-3 space-y-2">
													{adjustment.stripePaymentIntentId && (
														<div className="flex items-center gap-2 rounded-xl bg-gray-100 p-2 dark:bg-gray-800">
															<span className="shrink-0 text-[0.65rem] font-medium text-gray-500 uppercase dark:text-gray-400">
																PI
															</span>
															<code className="flex-1 font-mono text-[0.7rem] break-all text-gray-700 dark:text-gray-300">
																{adjustment.stripePaymentIntentId}
															</code>
															<button
																type="button"
																onClick={() => handleCopy(adjustment.stripePaymentIntentId!)}
																className="shrink-0 cursor-pointer rounded px-1.5 py-1 text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
																title="Copy Payment Intent ID"
															>
																<Copy className="h-3 w-3" />
															</button>
														</div>
													)}
													{adjustment.stripeRefundId && (
														<div className="flex items-center gap-2 rounded-xl bg-gray-100 p-2 dark:bg-gray-800">
															<span className="shrink-0 text-[0.65rem] font-medium text-gray-500 uppercase dark:text-gray-400">
																Refund
															</span>
															<code className="flex-1 font-mono text-[0.7rem] break-all text-gray-700 dark:text-gray-300">
																{adjustment.stripeRefundId}
															</code>
															<button
																type="button"
																onClick={() => handleCopy(adjustment.stripeRefundId!)}
																className="shrink-0 cursor-pointer rounded px-1.5 py-1 text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
																title="Copy Refund ID"
															>
																<Copy className="h-3 w-3" />
															</button>
														</div>
													)}
												</div>
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
								{translate('admin.eventDetails')}
							</p>
							<div className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-200">
								<div>
									<p className="font-semibold text-gray-900 dark:text-white">
										{t.title || translate('admin.unknownEvent')}
									</p>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										{t.location || translate('admin.noLocation')}
									</p>
								</div>
								<div className="grid gap-3 sm:grid-cols-2">
									<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('event.date')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{booking.occurrence?.date ? formatDateTime(booking.occurrence.date) : '—'}
									</p>
								</div>
									<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
										<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
											{translate('event.duration')}
										</p>
										<p className="mt-1 font-medium text-gray-900 dark:text-white">
											{event?.duration ? `${event.duration} min` : '—'}
										</p>
									</div>
									<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
										<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
											{translate('event.difficulty')}
										</p>
										<p className="mt-1 font-medium text-gray-900 dark:text-white">
											{event?.difficulty ?? '—'}
										</p>
									</div>
									<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
										<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
											{translate('admin.status')}
										</p>
										<p className="mt-1 font-medium text-gray-900 dark:text-white">{event?.status ?? '—'}</p>
									</div>
								</div>
								{t.whatsIncluded?.length ? (
									<div>
										<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
											{translate('admin.included')}
										</p>
										<ul className="mt-2 grid gap-2 text-sm text-gray-700 sm:grid-cols-2 dark:text-gray-200">
											{t.whatsIncluded.map((item) => (
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
								{t.description && (
									<div>
										<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
											{translate('admin.description')}
										</p>
										<p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-200">
											{t.description}
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
										{translate('admin.openMeetingLocation')}
									</a>
								)}
							</div>
						</section>

						{eventImages.length > 0 && (
							<section className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-950">
								<p className="text-sm font-semibold tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
									{translate('admin.eventImages')}
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
												alt={t.title || 'Event image'}
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
