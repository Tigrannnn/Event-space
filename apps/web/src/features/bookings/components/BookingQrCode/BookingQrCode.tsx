'use client';

import { useRef } from 'react';
import { Download } from 'lucide-react';
import QRCode from 'react-qr-code';
import Button from '@/components/ui/Buttons/Button';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import { useModalStore, useModalData, ModalType } from '@/stores/modalStore';
import { formatBookingReference } from '@/utils/booking';
import { useTranslation } from '@/hooks/translation';
import { localizePath } from '@/lib/i18n/config';

const DOWNLOAD_SIZE = 1024;
const DOWNLOAD_MARGIN = 64;

/** Draws the code onto a white canvas with a quiet margin, which scanners need and a bare SVG lacks. */
function downloadQrCode(svg: SVGSVGElement, fileName: string) {
	const sharp = svg.cloneNode(true) as SVGSVGElement;
	sharp.setAttribute('width', String(DOWNLOAD_SIZE));
	sharp.setAttribute('height', String(DOWNLOAD_SIZE));

	const image = new Image();
	image.onload = () => {
		const canvas = document.createElement('canvas');
		canvas.width = DOWNLOAD_SIZE;
		canvas.height = DOWNLOAD_SIZE;
		const context = canvas.getContext('2d');
		if (!context) return;

		context.fillStyle = '#ffffff';
		context.fillRect(0, 0, DOWNLOAD_SIZE, DOWNLOAD_SIZE);
		context.imageSmoothingEnabled = false;
		context.drawImage(
			image,
			DOWNLOAD_MARGIN,
			DOWNLOAD_MARGIN,
			DOWNLOAD_SIZE - DOWNLOAD_MARGIN * 2,
			DOWNLOAD_SIZE - DOWNLOAD_MARGIN * 2,
		);

		canvas.toBlob((blob) => {
			if (!blob) return;
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = fileName;
			link.click();
			URL.revokeObjectURL(url);
		}, 'image/png');
	};
	image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(sharp))}`;
}

export default function BookingQrCodeModal() {
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.BookingQrCode);
	const qrRef = useRef<HTMLDivElement>(null);

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
				<div ref={qrRef} className="mx-auto w-fit rounded-2xl bg-white p-4 in-data-[skin=market]:rounded-xl in-data-[skin=drawer]:rounded-xl in-data-[skin=market]:border in-data-[skin=drawer]:border in-data-[skin=market]:border-gray-200 in-data-[skin=drawer]:border-gray-200">
					<QRCode value={checkinUrl} size={220} />
				</div>
				<p className="text-primary mt-4 font-mono text-lg font-bold">
					{formatBookingReference(referenceNumber)}
				</p>
				<Button
					type="button"
					variant="secondary"
					size="md"
					className="mt-5 w-full"
					onClick={() => {
						const svg = qrRef.current?.querySelector('svg');
						if (svg) downloadQrCode(svg, `qr-${formatBookingReference(referenceNumber)}.png`);
					}}
				>
					<Download className="size-4" aria-hidden />
					{translate('booking.downloadQrCode')}
				</Button>
			</div>
		</Modal>
	);
}
