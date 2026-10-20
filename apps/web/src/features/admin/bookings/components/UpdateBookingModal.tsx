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
} from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';

const DECREASE_OPTIONS: QuantitySettlement[] = ['RULES', 'FULL', 'NONE'];
const INCREASE_OPTIONS: QuantitySettlement[] = ['OFFLINE_PAID', 'PAY_ON_ARRIVAL'];

export default function UpdateBookingModal() {
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.UpdateBooking);
	const booking = modalData?.booking as BookingWithDetails | null;

	const spotsLeft = booking?.occurrence
		? booking.occurrence.maxParticipants - booking.occurrence.currentParticipants
		: 0;
	const maxQuantity = Math.max(1, (booking?.quantity ?? 1) + spotsLeft);

	const [quantity, setQuantity] = useState(booking?.quantity ?? 1);
	const [decreaseSettlement, setDecreaseSettlement] = useState<QuantitySettlement>('RULES');
	const [increaseSettlement, setIncreaseSettlement] = useState<QuantitySettlement>('PAY_ON_ARRIVAL');
	const [openedAt] = useState(() => Date.now());
	const updateBooking = useUpdateBooking();

	const current = booking?.quantity ?? 1;
	const changed = quantity !== current;
	const increasing = quantity > current;
	const settlement = increasing ? increaseSettlement : decreaseSettlement;

	const quote = useAdminQuantityQuote(
		booking?.id,
		quantity,
		settlement,
		Boolean(booking) && changed,
	);

	if (!booking || !booking.occurrence?.event) {
		return null;
	}

	const title = getEventTranslation(booking.occurrence.event, translate.locale).title;
	const tourStarted = new Date(booking.occurrence.date).getTime() <= openedAt;

	const labels: Record<QuantitySettlement, string> = {
		RULES: translate('admin.settlementRules'),
		FULL: translate('admin.settlementFull'),
		NONE: translate('admin.settlementNone'),
		OFFLINE_PAID: translate('admin.settlementOfflinePaid'),
		PAY_ON_ARRIVAL: translate('admin.settlementPayOnArrival'),
	};
	const options = (increasing ? INCREASE_OPTIONS : DECREASE_OPTIONS).map((value) => ({
		value,
		label: labels[value],
	}));

	const ready = changed && quote.isSuccess && !quote.isFetching;

	const handleSave = () => {
		updateBooking.mutate({ id: booking.id, data: { quantity, settlement } });
	};

	return (
		<Modal onClose={closeModal} ariaLabel={translate('admin.updateBooking')}>
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50">
				<ModalHeader title={translate('admin.updateBooking')} onClose={closeModal} />

				<p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>

				{tourStarted && (
					<p className="mt-3 rounded-xl border border-amber-500 bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
						{translate('admin.quantityAfterTourWarning')}
					</p>
				)}

				<QuantitySelector
					quantity={quantity}
					maxQuantity={maxQuantity}
					onIncrement={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
					onDecrement={() => setQuantity((value) => Math.max(1, value - 1))}
					label={translate('admin.selectQuantity')}
					disabled={updateBooking.isPending}
				/>

				<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
					{translate('admin.availableSpots').replace('{count}', String(spotsLeft))}
				</p>

				{changed ? (
					<div className="mt-5 space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-200">
								{translate('admin.settlementLabel')}
							</label>
							<Select
								value={settlement}
								onValueChange={(value) =>
									increasing
										? setIncreaseSettlement(value as QuantitySettlement)
										: setDecreaseSettlement(value as QuantitySettlement)
								}
								options={options}
							/>
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
