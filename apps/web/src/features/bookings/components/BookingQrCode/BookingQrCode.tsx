'use client';

import QRCode from 'react-qr-code';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import { useModalStore, useModalData, ModalType } from '@/stores/modalStore';
import { formatBookingReference } from '@/utils/booking';
import { useTranslation } from '@/hooks/translation';

export default function BookingQrCodeModal() {
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.BookingQrCode);

	if (!modalData) {
		return null;
	}

	const { checkinToken, referenceNumber } = modalData;

	return (
		<Modal onClose={closeModal} size="sm" ariaLabel={translate('booking.showQrCode')}>
			<div className="w-full rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-gray-900">
				<ModalHeader title={translate('booking.showQrCode')} onClose={closeModal} />
				<p className="mt-2 mb-5 text-sm text-gray-500 dark:text-gray-400">
					{translate('booking.qrCodeHint')}
				</p>
				<div className="mx-auto w-fit rounded-2xl bg-white p-4">
					<QRCode value={checkinToken} size={220} />
				</div>
				<p className="text-primary mt-4 font-mono text-lg font-bold">
					{formatBookingReference(referenceNumber)}
				</p>
			</div>
		</Modal>
	);
}
