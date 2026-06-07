'use client';

import { useUpdateEvent } from '@/features/admin/hooks/useAdmin';
import EventForm from '../EventForm';
import { buildUpdateEventFormData } from '../EventForm/form-mappers';
import type { EventFormValues } from '../EventForm/event-form.schema';
import { useModalStore } from '@/stores';
import { ModalType, useModalData } from '@/stores/modalStore';
import { Modal } from '@/components/ui/Modal';
import { useRef } from 'react';

export default function UpdateEventModal() {
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.UpdateEvent);
	const eventToUpdate = modalData?.event;
	const isClosingRef = useRef(false);

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
			ariaLabel="Update Event Modal"
			disableBackdropClose={isPending}
			disableEscapeClose={isPending}
		>
			<EventForm
				event={eventToUpdate}
				onCancel={handleCancel}
				submitLabel={isPending ? 'Saving...' : 'Save changes'}
				isPending={isPending}
				onSubmit={handleSubmit}
			/>
		</Modal>
	);
}
