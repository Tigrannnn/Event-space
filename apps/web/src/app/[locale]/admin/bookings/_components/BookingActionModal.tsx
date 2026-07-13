'use client';

import { useState, type FormEvent } from 'react';
import { CheckCheck, XCircle } from 'lucide-react';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button/Button';
import Select from '@/components/ui/Select/Select';
import { useModalStore, useModalData } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import { useTranslation } from '@/hooks/translation';
import { useCancelBookingByAdmin, useUpdateBookingStatus } from '@/features/admin/hooks/useAdmin';
import { type AdminCancelBookingData } from '@event-space/shared';

export default function BookingActionModal() {
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.BookingAction);
	const booking = modalData?.booking;
	const cancelBooking = useCancelBookingByAdmin();
	const updateBookingStatus = useUpdateBookingStatus();
	const [refundType, setRefundType] = useState<AdminCancelBookingData['refundType']>('RULES');
	const [reason, setReason] = useState('');

	if (!booking) {
		return null;
	}

	const isPending = booking.status === 'PENDING';
	const refundOptions = [
		{ value: 'FULL', label: translate('admin.refundStrategyFull') },
		{ value: 'RULES', label: translate('admin.refundStrategyRules') },
		{ value: 'MANUAL', label: translate('admin.refundStrategyManual') },
	] as const;

	const handleConfirmBooking = () => {
		updateBookingStatus.mutate({ id: booking.id, status: 'CONFIRMED' });
	};

	const handleCancelBooking = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		cancelBooking.mutate({
			id: booking.id,
			data: {
				refundType,
				reason: reason.trim() || undefined,
			},
		});
	};

	return (
		<Modal onClose={closeModal} size="md" ariaLabel={isPending ? 'Confirm booking' : 'Cancel booking'}>
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50">
				<ModalHeader
					title={isPending ? translate('admin.confirmBooking') : translate('admin.cancelBooking')}
					onClose={closeModal}
				/>

				<div className="space-y-5">
					<div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
						<p className="text-sm font-medium text-gray-900 dark:text-white">
							{booking.user?.name || translate('booking.unknownCustomer')}
						</p>
						<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
							{booking.event ? booking.event.title || translate('booking.unknownEvent') : translate('booking.unknownEvent')}
						</p>
					</div>

					{isPending ? (
						<div className="space-y-4">
							<p className="text-sm text-gray-600 dark:text-gray-300">
								{translate('admin.confirmBooking')} {translate('admin.thisBooking')}?
							</p>
							<div className="flex justify-end gap-2">
								<Button
									type="button"
									size="sm"
									variant="secondary"
									onClick={closeModal}
								>
									{translate('booking.close')}
								</Button>
							</div>
						</div>
					) : (
						<form onSubmit={handleCancelBooking} className="space-y-4">
							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-700 dark:text-gray-200">
									{translate('admin.refundStrategy')}
								</label>
								<Select
									value={refundType}
									onValueChange={(value) => setRefundType(value as AdminCancelBookingData['refundType'])}
									options={refundOptions.map((option) => ({ value: option.value, label: option.label }))}
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-700 dark:text-gray-200">
									{translate('admin.reason')}
								</label>
								<textarea
									value={reason}
									onChange={(event) => setReason(event.target.value)}
									rows={4}
									placeholder={translate('admin.reasonPlaceholder')}
									className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
								/>
							</div>

							<div className="flex justify-end gap-2">
								<Button type="button" size="sm" variant="secondary" onClick={closeModal}>
									{translate('booking.close')}
								</Button>
								<Button type="submit" variant="danger" size="sm" isLoading={cancelBooking.isPending}>
									<XCircle className="mr-2 h-4 w-4" />
									{translate('admin.cancelBooking')}
								</Button>
							</div>
						</form>
					)}
				</div>
			</div>
		</Modal>
	);
}
