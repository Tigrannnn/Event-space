'use client';

import QRCode from 'react-qr-code';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import { useModalStore, useModalData, ModalType } from '@/stores/modalStore';
import { formatBookingReference } from '@/utils/booking';
import { useTranslation } from '@/hooks/translation';
import { localizePath } from '@/lib/i18n/config';

export default function BookingQrCodeModal() {
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.BookingQrCode);

	if (!modalData) {
		return null;
	}

	const { checkinToken, referenceNumber } = modalData;
	// A bare token read like a URL to the scanning camera app — it needs to BE one, the same
	// link the admin's checkin page already resolves by ?token=.
	const checkinUrl =
		typeof window !== 'undefined'
			? `${window.location.origin}${localizePath('/admin/checkin', translate.locale)}?token=${encodeURIComponent(checkinToken)}`
			: checkinToken;

	return (
		<Modal onClose={closeModal} size="sm" ariaLabel={translate('booking.showQrCode')}>
			<div className="w-full rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-gray-900 in-data-[skin=market]:shadow-none in-data-[skin=drawer]:shadow-none in-data-[skin=market]:dark:bg-neutral-900 in-data-[skin=drawer]:dark:bg-neutral-900">
				<ModalHeader title={translate('booking.showQrCode')} onClose={closeModal} />
				<p className="mt-2 mb-5 text-sm text-gray-500 dark:text-gray-400">
					{translate('booking.qrCodeHint')}
				</p>
				<div className="mx-auto w-fit rounded-2xl bg-white p-4 in-data-[skin=market]:rounded-xl in-data-[skin=drawer]:rounded-xl in-data-[skin=market]:border in-data-[skin=drawer]:border in-data-[skin=market]:border-gray-200 in-data-[skin=drawer]:border-gray-200">
					<QRCode value={checkinUrl} size={220} />
				</div>
				<p className="text-primary mt-4 font-mono text-lg font-bold">
					{formatBookingReference(referenceNumber)}
				</p>
			</div>
		</Modal>
	);
}
