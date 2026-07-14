'use client';

import { useUpdateEvent } from '@/features/admin/hooks/useAdmin';
import EventForm from '../EventForm';
import { buildUpdateEventFormData } from '../EventForm/form-mappers';
import type { EventFormValues } from '../EventForm/event-form.schema';
import { useModalStore } from '@/stores';
import { ModalType, useModalData } from '@/stores/modalStore';
import { Modal } from '@/components/ui/Modal';
import { useRef } from 'react';
import { useTranslation } from '@/hooks/translation';

export default function UpdateEventModal() {
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.UpdateEvent);
	const eventToUpdate = modalData?.event;
	const isClosingRef = useRef(false);
	const translate = useTranslation();

	if (!eventToUpdate) return null;

	const { mutateAsync: updateEvent, isPending } = useUpdateEvent();

	const handleSubmit = (values: EventFormValues) => {
		if (isClosingRef.current) {
			return;
		}
		return updateEvent({ id: eventToUpdate.id, formData: buildUpdateEventFormData(values) });
	};

	const handleCancel = () => {
		isClosingRef.current = true;
		closeModal();
	};

	return (
		<Modal
			onClose={() => {
				closeModal();
			}}
			size="full"
			position="center"
			ariaLabel={translate('admin.updateEventModal')}
			disableBackdropClose={true}
			disableEscapeClose={true}
		>
			<EventForm
				event={eventToUpdate}
				onCancel={handleCancel}
				submitLabel={isPending ? translate('admin.saving') : translate('admin.saveChanges')}
				isPending={isPending}
				onSubmit={handleSubmit}
			/>
		</Modal>
	);
}
