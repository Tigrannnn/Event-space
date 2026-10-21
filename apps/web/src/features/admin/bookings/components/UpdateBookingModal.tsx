'use client';

import { useState } from 'react';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button';
import Select from '@/components/ui/Select/Select';
import QuantitySelector from '@/features/bookings/components/QuantitySelector';
import QuantityQuotePreview from '@/features/bookings/components/QuantityQuotePreview';
import { useModalData, useModalStore } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import { useAdminQuantityQuote, useUpdateBooking } from '@/features/admin/hooks/useAdmin';
import {
	getEventTranslation,
	type BookingWithDetails,
	type QuantitySettlement,
	type RefundMethod,
} from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';

export default function UpdateBookingModal() {
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.UpdateBooking);
	const booking = modalData?.booking as BookingWithDetails | null;

	const current = booking?.quantity ?? 1;
	const paidByCard = booking?.paymentMethod === 'SITE_PAYMENT';

	const [quantity, setQuantity] = useState(Math.max(1, current - 1));
	const [settlement, setSettlement] = useState<QuantitySettlement>('RULES');
	const [chosenMethod, setChosenMethod] = useState<RefundMethod>('STRIPE');
	const [openedAt] = useState(() => Date.now());
	const updateBooking = useUpdateBooking();

	const refundMethod: RefundMethod = paidByCard ? chosenMethod : 'MANUAL';
	const changed = quantity !== current;

	const quote = useAdminQuantityQuote(
		booking?.id,
		quantity,
		settlement,
		refundMethod,
		Boolean(booking) && changed,
	);

	if (!booking || !booking.occurrence?.event) {
		return null;
	}

	const title = getEventTranslation(booking.occurrence.event, translate.locale).title;
	const tourStarted = new Date(booking.occurrence.date).getTime() <= openedAt;
	const ready = changed && quote.isSuccess && !quote.isFetching;

	const settlementOptions = [
		{ value: 'RULES', label: translate('admin.settlementRules') },
		{ value: 'FULL', label: translate('admin.settlementFull') },
	];
	const methodOptions = [
		{ value: 'STRIPE', label: translate('admin.refundMethodStripe') },
		{ value: 'MANUAL', label: translate('admin.refundMethodManual') },
	];

	const handleSave = () => {
		updateBooking.mutate({ id: booking.id, data: { quantity, settlement, refundMethod } });
	};

	return (
		<Modal onClose={closeModal} ariaLabel={translate('admin.updateBooking')}>
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50">
				<ModalHeader title={translate('admin.updateBooking')} onClose={closeModal} />

				<p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
				<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
					{translate('admin.quantityDecreaseOnly')}
				</p>

				{tourStarted && (
					<p className="mt-3 rounded-xl border border-amber-500 bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
						{translate('admin.quantityAfterTourWarning')}
					</p>
				)}

				<QuantitySelector
					quantity={quantity}
					maxQuantity={current}
					onIncrement={() => setQuantity((value) => Math.min(current, value + 1))}
					onDecrement={() => setQuantity((value) => Math.max(1, value - 1))}
					label={translate('admin.selectQuantity')}
					disabled={updateBooking.isPending}
				/>

				{changed ? (
					<div className="mt-5 space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-200">
								{translate('admin.settlementLabel')}
							</label>
							<Select
								value={settlement}
								onValueChange={(value) => setSettlement(value as QuantitySettlement)}
								options={settlementOptions}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-200">
								{translate('admin.refundMethodLabel')}
							</label>
							{paidByCard ? (
								<Select
									value={chosenMethod}
									onValueChange={(value) => setChosenMethod(value as RefundMethod)}
									options={methodOptions}
								/>
							) : (
								<p className="text-sm text-gray-600 dark:text-gray-300">
									{translate('admin.refundManualOnly')}
								</p>
							)}
						</div>

						<QuantityQuotePreview
							quote={quote.data}
							isLoading={quote.isLoading || quote.isFetching}
							isError={quote.isError}
						/>
					</div>
				) : (
					<p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
						{translate('admin.quantityPickAnother')}
					</p>
				)}

				<div className="mt-6 flex gap-3">
					<Button
						variant="secondary"
						onClick={closeModal}
						disabled={updateBooking.isPending}
						className="flex-1"
					>
						{translate('common.cancel')}
					</Button>
					<Button
						variant="primary"
						onClick={handleSave}
						isLoading={updateBooking.isPending}
						disabled={!ready || updateBooking.isPending}
						className="flex-1"
					>
						{translate('admin.saveChanges')}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
