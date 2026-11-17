'use client';

import { useState, type FormEvent } from 'react';
import { Banknote } from 'lucide-react';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button/Button';
import Input from '@/components/ui/Inputs/Input';
import { useModalStore, useModalData } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import { useTranslation } from '@/hooks/translation';
import { useFormatCurrency } from '@/hooks/format';
import { useAcceptBookingPayment } from '@/features/admin/hooks/useAdmin';
import { dueOnSiteOf, getEventTranslation } from '@event-space/shared';

export default function AcceptBookingPaymentModal() {
	const translate = useTranslation();
	const formatCurrency = useFormatCurrency();
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.AcceptBookingPayment);
	const booking = modalData?.booking;
	const event = booking?.occurrence?.event;
	const due = booking ? dueOnSiteOf(booking) : undefined;

	const acceptPayment = useAcceptBookingPayment();
	const [amount, setAmount] = useState(due === undefined ? '' : String(due));

	if (!booking || !event || due === undefined) {
		return null;
	}

	const eventTranslate = getEventTranslation(event, translate.locale);
	const amountValue = Number(amount.trim().replace(',', '.'));
	const isValid = amount.trim() !== '' && amountValue > 0 && amountValue <= due;

	const handleSubmit = (formEvent: FormEvent<HTMLFormElement>) => {
		formEvent.preventDefault();
		if (!isValid) return;

		acceptPayment.mutate({ id: booking.id, data: { amount: amountValue } });
	};

	return (
		<Modal onClose={closeModal} size="md" ariaLabel={translate('admin.acceptPayment')}>
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50">
				<ModalHeader title={translate('admin.acceptPayment')} onClose={closeModal} />

				<div className="space-y-5">
					<div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
						<p className="text-sm font-medium text-gray-900 dark:text-white">
							{booking.user?.name || translate('booking.unknownCustomer')}
						</p>
						<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
							{eventTranslate.title || translate('booking.unknownEvent')}
						</p>
						<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
							{`${translate('admin.dueOnSite')}: ${formatCurrency(due)}`}
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<Input
							label={translate('admin.acceptPaymentAmount')}
							inputMode="decimal"
							value={amount}
							onChange={(event) => setAmount(event.target.value)}
							required
						/>
						<p className="-mt-2 text-xs text-gray-500 dark:text-gray-400">
							{translate('admin.acceptPaymentHint')}
						</p>

						<div className="flex justify-end gap-2">
							<Button type="button" size="sm" variant="secondary" onClick={closeModal}>
								{translate('booking.close')}
							</Button>
							<Button
								type="submit"
								variant="primary"
								size="sm"
								isLoading={acceptPayment.isPending}
								disabled={!isValid || acceptPayment.isPending}
							>
								<Banknote className="mr-2 h-4 w-4" />
								{translate('admin.acceptPayment')}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</Modal>
	);
}
