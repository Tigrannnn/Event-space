'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';
import { QrCode } from 'lucide-react';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import { formatBookingReference } from '@/utils/booking';
import { useTranslation } from '@/hooks/translation';

export function BookingQrCode({
	checkinToken,
	referenceNumber,
}: {
	checkinToken: string;
	referenceNumber: number | null;
}) {
	const translate = useTranslation();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				aria-label={translate('booking.showQrCode')}
				className="hover:border-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:text-primary dark:border-gray-700 dark:text-gray-400"
			>
				<QrCode className="h-4 w-4" />
			</button>

			{isOpen && (
				<Modal onClose={() => setIsOpen(false)} size="sm" ariaLabel={translate('booking.showQrCode')}>
					<div className="w-full rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-gray-900">
						<ModalHeader title={translate('booking.showQrCode')} onClose={() => setIsOpen(false)} />
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
			)}
		</>
	);
}
