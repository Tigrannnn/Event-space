'use client';

import { useState } from 'react';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button';
import QuantitySelector from '@/features/bookings/components/QuantitySelector';
import QuantityQuotePreview from '@/features/bookings/components/QuantityQuotePreview';
import { useModalData, useModalStore } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import { useTranslation } from '@/hooks/translation';
import { getEventTranslation } from '@event-space/shared';
import { useChangeQuantity, useQuantityQuote } from '../../hooks/useBookings';

export default function ChangeQuantityModal() {
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const booking = useModalData(ModalType.ChangeQuantity)?.booking;

	const [quantity, setQuantity] = useState(Math.max(1, (booking?.quantity ?? 2) - 1));
	const changeQuantity = useChangeQuantity();
	const quote = useQuantityQuote(booking?.id, quantity, Boolean(booking));

	if (!booking?.occurrence?.event) return null;

	const maxQuantity = Math.max(1, booking.quantity - 1);
	const title = getEventTranslation(booking.occurrence.event, translate.locale).title;
	const ready = quote.isSuccess && !quote.isFetching;

	const handleConfirm = () => {
		changeQuantity.mutate({
			id: booking.id,
			data: { quantity, expectedRefundInCents: quote.data?.refund?.netInCents ?? 0 },
		});
	};

	return (
		<Modal onClose={closeModal} ariaLabel={translate('booking.changeQuantityTitle')}>
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50">
				<ModalHeader title={translate('booking.changeQuantityTitle')} onClose={closeModal} />

				<p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
				<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
					{translate('booking.changeQuantityHint')}
				</p>

				<QuantitySelector
					quantity={quantity}
					maxQuantity={maxQuantity}
					onIncrement={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
					onDecrement={() => setQuantity((current) => Math.max(1, current - 1))}
					label={translate('booking.changeQuantityNew')}
					disabled={changeQuantity.isPending}
				/>

				<div className="mt-5">
					<QuantityQuotePreview
						quote={quote.data}
						isLoading={quote.isLoading || quote.isFetching}
						isError={quote.isError}
					/>
				</div>

				<div className="mt-6 flex gap-3">
					<Button
						variant="secondary"
						onClick={closeModal}
						disabled={changeQuantity.isPending}
						className="flex-1"
					>
						{translate('booking.close')}
					</Button>
					<Button
						variant="primary"
						onClick={handleConfirm}
						isLoading={changeQuantity.isPending}
						disabled={!ready || changeQuantity.isPending}
						className="flex-1"
					>
						{translate('booking.changeQuantityConfirm')}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
