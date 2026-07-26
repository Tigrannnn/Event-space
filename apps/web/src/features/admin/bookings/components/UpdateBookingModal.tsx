'use client';

import { useState } from 'react';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button';
import QuantitySelector from '@/features/bookings/components/QuantitySelector';
import { useModalData, useModalStore } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import { useUpdateBooking } from '@/features/admin/hooks/useAdmin';
import { BookingWithDetails, getEventTranslation } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { useFormatCurrency, useFormatDate } from '@/hooks/format';

export default function UpdateBookingModal() {
	const translate = useTranslation();
	const locale = translate.locale;
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.UpdateBooking);
	const booking = modalData?.booking as BookingWithDetails | null;
	const { mutate: updateBooking, isPending: isLoading } = useUpdateBooking();
	const { formatDateTime } = useFormatDate();
	const formatCurrency = useFormatCurrency();

	const spotsLeftForUser = booking?.occurrence
		? booking.occurrence.maxParticipants - booking.occurrence.currentParticipants + booking.quantity
		: 0;
	const maxQuantity = Math.max(1, spotsLeftForUser);
	const [quantity, setQuantity] = useState(booking?.quantity ?? 1);

	if (!booking || !booking.occurrence?.event || !booking.occurrence) {
		return null;
	}

	const eventTranslation = getEventTranslation(booking.occurrence.event, locale);

	const handleSave = () => {
		updateBooking({ id: booking.id, data: { quantity } });
	};

	return (
		<Modal onClose={closeModal} ariaLabel={translate('admin.updateBooking')}>
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50">
				<ModalHeader title={translate('admin.updateBooking')} onClose={closeModal} />

				<QuantitySelector
					quantity={quantity}
					maxQuantity={maxQuantity}
					onIncrement={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
					onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
					label={translate('admin.selectQuantity')}
					disabled={isLoading}
				/>

				<p className="text-sm text-gray-500 dark:text-gray-400">
					{translate('admin.availableSpots').replace('{count}', String(spotsLeftForUser))}
				</p>

				<div className="mt-6 flex gap-3">
					<Button variant="secondary" onClick={closeModal} disabled={isLoading} className="flex-1">
						{translate('common.cancel')}
					</Button>
					<Button
						variant="primary"
						onClick={handleSave}
						isLoading={isLoading}
						disabled={quantity < 1 || quantity > maxQuantity || isLoading}
						className="flex-1"
					>
						{translate('admin.saveChanges')}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
