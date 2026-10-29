'use client';

import { useState } from 'react';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button';
import QuantitySelector from '@/features/bookings/components/QuantitySelector';
import QuantityQuotePreview from '@/features/bookings/components/QuantityQuotePreview';
import QuantityPaymentForm from '@/features/bookings/components/QuantityPaymentForm';
import { useModalData, useModalStore } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import { useTranslation } from '@/hooks/translation';
import { useFormatCurrency } from '@/hooks/format';
import { getEventTranslation, type StartQuantityPayment } from '@event-space/shared';
import {
	useChangeQuantity,
	useQuantityQuote,
	useStartQuantityPayment,
} from '../../hooks/useBookings';

export default function ChangeQuantityModal() {
	const translate = useTranslation();
	const formatCurrency = useFormatCurrency();
	const { closeModal } = useModalStore();
	const booking = useModalData(ModalType.ChangeQuantity)?.booking;

	const current = booking?.quantity ?? 1;
	const spotsLeft = booking?.occurrence
		? Math.max(0, booking.occurrence.maxParticipants - booking.occurrence.currentParticipants)
		: 0;
	const maxQuantity = current + spotsLeft;
	const [quantity, setQuantity] = useState(
		current > 1 ? current : Math.min(current + 1, maxQuantity),
	);
	const [payment, setPayment] = useState<StartQuantityPayment | null>(null);

	const changeQuantity = useChangeQuantity();
	const startPayment = useStartQuantityPayment();
	const changed = quantity !== current;
	const quote = useQuantityQuote(booking?.id, quantity, Boolean(booking) && changed);

	if (!booking?.occurrence?.event) return null;

	const increasing = quantity > current;
	const title = getEventTranslation(booking.occurrence.event, translate.locale).title;
	const ready = changed && quote.isSuccess && !quote.isFetching;
	const busy = changeQuantity.isPending || startPayment.isPending;

	const handleConfirm = () => {
		if (increasing) {
			startPayment.mutate(
				{ id: booking.id, quantity },
				{ onSuccess: (started) => setPayment(started) },
			);
			return;
		}

		changeQuantity.mutate({
			id: booking.id,
			data: { quantity, expectedRefundInCents: quote.data?.refund?.netInCents ?? 0 },
		});
	};

	return (
		<Modal onClose={closeModal} ariaLabel={translate('booking.changeQuantityTitle')}>
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50 in-data-[skin=market]:shadow-none in-data-[skin=drawer]:shadow-none in-data-[skin=market]:dark:bg-neutral-900 in-data-[skin=drawer]:dark:bg-neutral-900">
				<ModalHeader title={translate('booking.changeQuantityTitle')} onClose={closeModal} />

				<p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>

				{payment ? (
					<div className="mt-4">
						<QuantityPaymentForm
							bookingId={booking.id}
							payment={payment}
							onBack={() => setPayment(null)}
							onDone={closeModal}
						/>
					</div>
				) : (
					<>
						<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
							{translate('booking.changeQuantityHint')}
						</p>

						<QuantitySelector
							quantity={quantity}
							maxQuantity={maxQuantity}
							onIncrement={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
							onDecrement={() => setQuantity((value) => Math.max(1, value - 1))}
							label={translate('booking.changeQuantityNew')}
							disabled={busy}
						/>

						{changed && (
							<div className="mt-5">
								<QuantityQuotePreview
									quote={quote.data}
									isLoading={quote.isLoading || quote.isFetching}
									isError={quote.isError}
								/>
							</div>
						)}

						<div className="mt-6 flex gap-3">
							<Button variant="secondary" onClick={closeModal} disabled={busy} className="flex-1">
								{translate('booking.close')}
							</Button>
							<Button
								variant="primary"
								onClick={handleConfirm}
								isLoading={busy}
								disabled={!ready || busy}
								className="flex-1"
							>
								{increasing && quote.data
									? translate('booking.changeQuantityPay', {
											amount: formatCurrency(quote.data.dueInCents / 100),
										})
									: translate('booking.changeQuantityConfirm')}
							</Button>
						</div>
					</>
				)}
			</div>
		</Modal>
	);
}
