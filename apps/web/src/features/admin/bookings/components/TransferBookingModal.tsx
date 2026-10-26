'use client';

import { useState, type FormEvent } from 'react';
import { CalendarClock } from 'lucide-react';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button/Button';
import Input from '@/components/ui/Inputs/Input';
import { useModalStore, useModalData } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import { useTranslation } from '@/hooks/translation';
import { useFormatDate } from '@/hooks/format';
import { useTransferBooking } from '@/features/admin/hooks/useAdmin';
import { getEventTranslation } from '@event-space/shared';

export default function TransferBookingModal() {
	const translate = useTranslation();
	const { formatDateTime } = useFormatDate();
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.TransferBooking);
	const booking = modalData?.booking;
	const event = booking?.occurrence?.event;

	const transferBooking = useTransferBooking();
	const [occurrenceId, setOccurrenceId] = useState<string | null>(null);
	const [reason, setReason] = useState('');

	if (!booking || !event) {
		return null;
	}

	const now = Date.now();
	const candidates = (event.occurrences ?? [])
		.filter(
			(occurrence) =>
				occurrence.id !== booking.occurrenceId &&
				occurrence.status === 'ACTIVE' &&
				new Date(occurrence.date).getTime() > now &&
				occurrence.maxParticipants - occurrence.currentParticipants >= booking.quantity,
		)
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

	const eventTranslate = getEventTranslation(event, translate.locale);

	const handleSubmit = (formEvent: FormEvent<HTMLFormElement>) => {
		formEvent.preventDefault();
		if (!occurrenceId) return;

		transferBooking.mutate({
			id: booking.id,
			data: { occurrenceId, reason: reason.trim() || undefined },
		});
	};

	return (
		<Modal onClose={closeModal} size="md" ariaLabel="Transfer booking">
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50">
				<ModalHeader title={translate('admin.transferBooking')} onClose={closeModal} />

				<div className="space-y-5">
					<div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
						<p className="text-sm font-medium text-gray-900 dark:text-white">
							{booking.user?.name || translate('booking.unknownCustomer')}
						</p>
						<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{eventTranslate.title}</p>
						<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
							{translate('admin.transferBookingHint')}
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-200">
								{translate('admin.transferNewDate')}
							</label>

							{candidates.length === 0 ? (
								<p className="text-sm text-gray-500 dark:text-gray-400">
									{translate('admin.transferNoDates')}
								</p>
							) : (
								<div className="max-h-64 space-y-2 overflow-y-auto pr-1">
									{candidates.map((occurrence) => {
										const spotsLeft = occurrence.maxParticipants - occurrence.currentParticipants;
										const isSelected = occurrenceId === occurrence.id;

										return (
											<button
												key={occurrence.id}
												type="button"
												onClick={() => setOccurrenceId(occurrence.id)}
												className={`w-full rounded-xl border p-3 text-left transition-all ${
													isSelected
														? 'border-primary bg-primary/10 dark:bg-primary/20'
														: 'hover:border-primary cursor-pointer border-gray-200 dark:border-gray-700'
												}`}
											>
												<div className="flex items-center justify-between">
													<span className="text-sm font-medium text-gray-900 dark:text-white">
														{formatDateTime(occurrence.date)}
													</span>
													<span className="text-xs text-gray-500 dark:text-gray-400">
														{spotsLeft} {translate('booking.spotsLeft')}
													</span>
												</div>
											</button>
										);
									})}
								</div>
							)}
						</div>

						<Input
							label={translate('admin.transferReason')}
							value={reason}
							onChange={(event) => setReason(event.target.value)}
						/>

						<div className="flex justify-end gap-2">
							<Button type="button" size="sm" variant="secondary" onClick={closeModal}>
								{translate('booking.close')}
							</Button>
							<Button
								type="submit"
								variant="primary"
								size="sm"
								isLoading={transferBooking.isPending}
								disabled={!occurrenceId || transferBooking.isPending}
							>
								<CalendarClock className="mr-2 h-4 w-4" />
								{translate('admin.transferBooking')}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</Modal>
	);
}
