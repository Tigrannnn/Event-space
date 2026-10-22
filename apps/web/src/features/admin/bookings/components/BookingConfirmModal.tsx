'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle } from 'lucide-react';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button/Button';
import Select from '@/components/ui/Select/Select';
import { useModalStore, useModalData } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import { useTranslation } from '@/hooks/translation';
import { useConfirmBookingManually } from '@/features/admin/hooks/useAdmin';
import QuantitySelector from '@/features/bookings/components/QuantitySelector';
import { useFormatCurrency } from '@/hooks/format';
import { getEventTranslation, type ConfirmBookingManuallyData } from '@event-space/shared';

type ManualPaymentMethod = ConfirmBookingManuallyData['paymentMethod'];

export default function BookingConfirmModal() {
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.BookingConfirm);
	const booking = modalData?.booking;
	const occurrence = booking?.occurrence;
	const event = occurrence?.event;

	const confirmBooking = useConfirmBookingManually();
	const formatCurrency = useFormatCurrency();
	const [paymentMethod, setPaymentMethod] = useState<ManualPaymentMethod>('OFFLINE_PAID');
	const [quantity, setQuantity] = useState(booking?.quantity ?? 1);

	if (!booking || !occurrence || !event) {
		return null;
	}

	const maxQuantity = Math.max(1, occurrence.maxParticipants - occurrence.currentParticipants);

	const eventTranslate = getEventTranslation(event, translate.locale);

	const methodOptions = [
		{ value: 'OFFLINE_PAID', label: translate('admin.confirmBookingPaidOffline') },
		{ value: 'PAY_ON_ARRIVAL', label: translate('admin.confirmBookingPayOnArrival') },
	];

	const methodHint =
		paymentMethod === 'OFFLINE_PAID'
			? translate('admin.confirmBookingPaidOfflineHint')
			: translate('admin.confirmBookingPayOnArrivalHint');

	const handleSubmit = (submitEvent: FormEvent<HTMLFormElement>) => {
		submitEvent.preventDefault();
		confirmBooking.mutate({ id: booking.id, data: { paymentMethod, quantity } });
	};

	return (
		<Modal onClose={closeModal} size="md" ariaLabel={translate('admin.confirmBooking')}>
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50">
				<ModalHeader title={translate('admin.confirmBooking')} onClose={closeModal} />

				<div className="space-y-5">
					<div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
						<p className="text-sm font-medium text-gray-900 dark:text-white">
							{booking.user?.name || translate('booking.unknownCustomer')}
						</p>
						<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
							{eventTranslate.title || translate('booking.unknownEvent')}
						</p>
					</div>

					<p className="text-sm text-gray-500 dark:text-gray-400">
						{translate('admin.confirmBookingHint')}
					</p>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<QuantitySelector
								quantity={quantity}
								maxQuantity={maxQuantity}
								onIncrement={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
								onDecrement={() => setQuantity((current) => Math.max(1, current - 1))}
								label={translate('admin.numberOfSpots')}
							/>
							<p className="text-sm text-gray-700 dark:text-gray-200">
								{translate('booking.total')}:{' '}
								<span className="font-semibold">{formatCurrency(event.price, { quantity })}</span>
							</p>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-200">
								{translate('admin.confirmBookingMethod')}
							</label>
							<Select
								value={paymentMethod}
								onValueChange={(value) => setPaymentMethod(value as ManualPaymentMethod)}
								options={methodOptions}
								className="w-full"
							/>
							<p className="text-xs text-gray-500">{methodHint}</p>
						</div>

						<div className="flex justify-end gap-2">
							<Button type="button" size="sm" variant="secondary" onClick={closeModal}>
								{translate('booking.close')}
							</Button>
							<Button type="submit" variant="primary" size="sm" isLoading={confirmBooking.isPending}>
								<CheckCircle className="mr-2 h-4 w-4" />
								{translate('admin.confirmBookingSubmit')}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</Modal>
	);
}
