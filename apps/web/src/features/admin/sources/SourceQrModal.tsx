'use client';

import { useRef } from 'react';
import { Copy, Download } from 'lucide-react';
import QRCode from 'react-qr-code';
import Button from '@/components/ui/Buttons/Button';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import { downloadQrCode } from '@/features/bookings/components/BookingQrCode/BookingQrCode';
import { useCopyToClipboard } from '@/hooks/clipboard';
import { useTranslation } from '@/hooks/translation';
import { ModalType, useModalData, useModalStore } from '@/stores/modalStore';
import { sourceLink } from './sourceLink';

export default function SourceQrModal() {
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const copyToClipboard = useCopyToClipboard();
	const source = useModalData(ModalType.SourceQr)?.source;
	const qrRef = useRef<HTMLDivElement>(null);

	if (!source) return null;

	const link = sourceLink(source.code);

	return (
		<Modal onClose={closeModal} size="sm" ariaLabel={translate('admin.sourceShowQr')}>
			<div className="w-full rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-gray-900">
				<ModalHeader title={source.name} onClose={closeModal} />
				<p className="mt-2 mb-5 text-sm text-gray-500 dark:text-gray-400">{translate('admin.sourceQrHint')}</p>
				<div ref={qrRef} className="mx-auto w-fit rounded-2xl bg-white p-4">
					<QRCode value={link} size={220} />
				</div>
				<p className="mt-4 font-mono text-xs break-all text-gray-600 dark:text-gray-300">{link}</p>
				<div className="mt-5 flex flex-col gap-2">
					<Button
						type="button"
						size="md"
						className="w-full"
						onClick={() => void copyToClipboard(link, 'admin.sourceLinkCopied')}
					>
						<Copy className="size-4" aria-hidden />
						{translate('admin.sourceCopyLink')}
					</Button>
					<Button
						type="button"
						variant="secondary"
						size="md"
						className="w-full"
						onClick={() => {
							const svg = qrRef.current?.querySelector('svg');
							if (svg) downloadQrCode(svg, `qr-${source.code}.png`);
						}}
					>
						<Download className="size-4" aria-hidden />
						{translate('admin.sourceDownloadQr')}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
