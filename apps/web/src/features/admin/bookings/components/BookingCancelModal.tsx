'use client';

import { useState, type FormEvent } from 'react';
import { XCircle } from 'lucide-react';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button/Button';
import Select from '@/components/ui/Select/Select';
import { useModalStore, useModalData } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import { useTranslation } from '@/hooks/translation';
import { useCancelBookingByAdmin, useUpdateBookingStatus } from '@/features/admin/hooks/useAdmin';
import { getEventTranslation, type AdminCancelBookingData } from '@event-space/shared';

export default function BookingCancelModal() {
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.BookingCancel);
	const booking = modalData?.booking;
	const occurrence = booking?.occurrence;
	const event = occurrence?.event;

	const cancelBooking = useCancelBookingByAdmin();
	const [refundType, setRefundType] = useState<AdminCancelBookingData['refundType']>('RULES');
	const [reason, setReason] = useState('');

	if (!booking || !occurrence || !event) {
		return null;
	}

	const refundOptions = [
		{ value: 'FULL', label: translate('admin.refundStrategyFull') },
		{ value: 'RULES', label: translate('admin.refundStrategyRules') },
		{ value: 'MANUAL', label: translate('admin.refundStrategyManual') },
	] as const;
	
	if (booking.paymentMethod !== 'SITE_PAYMENT') {
		setRefundType('MANUAL');
	}

	const eventTranslate = getEventTranslation(event, translate.locale);

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
		<Modal onClose={closeModal} size="md" ariaLabel={'Cancel booking'}>
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50">
				<ModalHeader title={translate('admin.cancelBooking')} onClose={closeModal} />

				<div className="space-y-5">
					<div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
						<p className="text-sm font-medium text-gray-900 dark:text-white">
							{booking.user?.name || translate('booking.unknownCustomer')}
						</p>
						<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
							{eventTranslate.title || translate('booking.unknownEvent')}
						</p>
					</div>
					<form onSubmit={handleCancelBooking} className="space-y-4">
						
						<div className="space-y-2">
							{booking.paymentMethod !== 'SITE_PAYMENT' && (
								<p className="text-sm text-gray-700 dark:text-gray-200">
									{translate('admin.refundStrategyManual')}
								</p>
							)}
							<label className="mr-4 text-sm font-medium text-gray-700 dark:text-gray-200">
								{translate('admin.refundStrategy')}
							</label>
							<Select
								value={refundType}
								onValueChange={(value) => setRefundType(value as AdminCancelBookingData['refundType'])}
								options={refundOptions.map((option) => ({ value: option.value, label: option.label }))}
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
				</div>
			</div>
		</Modal>
	);
}
