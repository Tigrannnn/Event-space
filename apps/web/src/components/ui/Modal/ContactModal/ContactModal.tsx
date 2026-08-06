'use client';

import { useModalStore, useModalData } from '@/stores/modalStore/modalStore';
import { ContactType, ModalType } from '@/stores/modalStore/types';
import Modal from '../Modal';
import Button from '../../Buttons/Button';
import { useTranslation } from '@/hooks/translation';
import { Instagram, Phone, Mail, MapPin } from 'lucide-react';
import { COMPANY_CONFIG } from '@/config/сompany';

export default function ContactModal() {
	const { closeModal } = useModalStore();
	const data = useModalData(ModalType.ContactInfo);
	const translate = useTranslation();

	if (!data) return null;

	const getIcon = () => {
		switch (data.type) {
			case ContactType.Instagram:
				return <Instagram className="h-12 w-12 text-primary" strokeWidth={1.5} />;
			case ContactType.Phone:
				return <Phone className="h-12 w-12 text-primary" strokeWidth={1.5} />;
			case ContactType.Email:
				return <Mail className="h-12 w-12 text-primary" strokeWidth={1.5} />;
			case ContactType.Location:
				return <MapPin className="h-12 w-12 text-primary" strokeWidth={1.5} />;
		}
	};

	const getTitleKey = () => {
		switch (data.type) {
			case ContactType.Instagram:
				return 'header.contactInstagramTitle';
			case ContactType.Phone:
				return 'header.contactPhoneTitle';
			case ContactType.Email:
				return 'header.contactEmailTitle';
			case ContactType.Location:
				return 'header.contactLocationTitle';
		}
	};

	const getDescriptionKey = () => {
		switch (data.type) {
			case ContactType.Instagram:
				return 'header.contactInstagramDescription';
			case ContactType.Phone:
				return 'header.contactPhoneDescription';
			case ContactType.Email:
				return 'header.contactEmailDescription';
			case ContactType.Location:
				return 'header.contactLocationDescription';
		}
	};

	const getButtonKey = () => {
		switch (data.type) {
			case ContactType.Instagram:
				return 'header.contactInstagramButton';
			case ContactType.Phone:
				return 'header.contactPhoneButton';
			case ContactType.Email:
				return 'header.contactEmailButton';
			case ContactType.Location:
				return 'header.contactLocationButton';
		}
	};

	const handleAction = () => {
		switch (data.type) {
			case ContactType.Instagram:
				window.open(data.value, '_blank');
				break;
			case ContactType.Phone:
				window.location.href = `tel:${data.value.replace(/\s/g, '')}`;
				break;
			case ContactType.Email:
				window.location.href = `mailto:${data.value}`;
				break;
			case ContactType.Location:
				// data.value is the human-readable address shown in the box below; the map link
				// lives separately in config since a street address isn't itself a valid URL.
				window.open(COMPANY_CONFIG.location.mapsUrl, '_blank');
				break;
		}
		closeModal();
	};

	return (
		<Modal ariaLabel={translate(getTitleKey())} onClose={closeModal} size="sm" position="center">
			<div className="max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
				<div className="mb-4 flex justify-center">{getIcon()}</div>
				<h3 className="text-primary mb-2 text-center text-xl font-black">{translate(getTitleKey())}</h3>
				<p className="mb-4 text-center text-gray-600 dark:text-gray-300">{translate(getDescriptionKey())}</p>
				<div className="mb-6 rounded-xl bg-gray-100 p-4 text-center font-mono text-sm dark:bg-gray-700 dark:text-gray-200">
					{data.value}
				</div>

				<div className="flex gap-3">
					<Button variant="secondary" onClick={closeModal} className="flex-1">
						{translate('common.close')}
					</Button>
					<Button variant="primary" type="button" onClick={handleAction} className="flex-1">
						{translate(getButtonKey())}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
