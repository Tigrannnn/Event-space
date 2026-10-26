'use client';

import { useState, type FormEvent } from 'react';
import { HandCoins } from 'lucide-react';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button/Button';
import Select from '@/components/ui/Select/Select';
import Input from '@/components/ui/Inputs/Input';
import { useModalStore, useModalData } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import { useTranslation } from '@/hooks/translation';
import { useCompensateBooking } from '@/features/admin/hooks/useAdmin';
import { getEventTranslation, type RefundMethod } from '@event-space/shared';

export default function CompensateBookingModal() {
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.CompensateBooking);
	const booking = modalData?.booking;
	const event = booking?.occurrence?.event;

	const compensate = useCompensateBooking();
	const [amount, setAmount] = useState('');
	const [method, setMethod] = useState<RefundMethod>('STRIPE');
	const [reason, setReason] = useState('');

	if (!booking || !event) {
		return null;
	}

	const isSitePayment = booking.paymentMethod === 'SITE_PAYMENT';
	const methodOptions = [
		{ value: 'STRIPE', label: translate('admin.refundMethodStripe') },
		{ value: 'MANUAL', label: translate('admin.refundMethodManual') },
	];

	const eventTranslate = getEventTranslation(event, translate.locale);
	const amountValue = Number(amount);
	const isValid = amount.trim() !== '' && amountValue > 0;

	const handleSubmit = (formEvent: FormEvent<HTMLFormElement>) => {
		formEvent.preventDefault();
		if (!isValid) return;

		compensate.mutate({
			id: booking.id,
			data: {
				amount: amountValue,
				method: isSitePayment ? method : 'MANUAL',
				reason: reason.trim() || undefined,
			},
		});
	};

	return (
		<Modal onClose={closeModal} size="md" ariaLabel="Compensate booking">
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50">
				<ModalHeader title={translate('admin.compensateBooking')} onClose={closeModal} />

				<div className="space-y-5">
					<div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
						<p className="text-sm font-medium text-gray-900 dark:text-white">
							{booking.user?.name || translate('booking.unknownCustomer')}
						</p>
						<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
							{eventTranslate.title || translate('booking.unknownEvent')}
						</p>
						<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
							{translate('admin.compensateBookingHint')}
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<Input
							label={translate('admin.compensateAmount')}
							type="number"
							min={1}
							step="0.01"
							value={amount}
							onChange={(event) => setAmount(event.target.value)}
							placeholder="2000"
							required
						/>

						<div className="space-y-2">
							<label className="mr-4 text-sm font-medium text-gray-700 dark:text-gray-200">
								{translate('admin.refundMethodLabel')}
							</label>
							{isSitePayment ? (
								<Select
									value={method}
									onValueChange={(value) => setMethod(value as RefundMethod)}
									options={methodOptions}
									className="w-full"
								/>
							) : (
								<p className="text-sm text-gray-700 dark:text-gray-200">
									{translate('admin.refundManualOnly')}
								</p>
							)}
						</div>

						<Input
							label={translate('admin.compensateReason')}
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
								isLoading={compensate.isPending}
								disabled={!isValid || compensate.isPending}
							>
								<HandCoins className="mr-2 h-4 w-4" />
								{translate('admin.compensateBooking')}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</Modal>
	);
}
