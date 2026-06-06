'use client';

import { useUpdateEvent } from '@/features/admin/hooks/useAdmin';
import EventForm from '../EventForm';
import { buildUpdateEventFormData } from '../EventForm/form-mappers';
import type { EventFormValues } from '../EventForm/event-form.schema';
import { useModalStore } from '@/stores';
import { ModalType, useModalData } from '@/stores/modalStore';
import { Modal } from '@/components/ui/Modal';

export default function UpdateEventModal() {
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.UpdateEvent);
	const eventToUpdate = modalData?.event;
	if (!eventToUpdate) return null;

	const { mutateAsync: updateEvent, isPending } = useUpdateEvent();

	return (
		<Modal
			onClose={closeModal}
			size="full"
			position="center"
			ariaLabel="Update Event Modal"
			disableBackdropClose={isPending}
			disableEscapeClose={isPending}
		>
			<EventForm
				event={eventToUpdate}
				onCancel={closeModal}
				submitLabel={isPending ? 'Saving...' : 'Save changes'}
				isPending={isPending}
				onSubmit={(values: EventFormValues) =>
					updateEvent({ id: eventToUpdate.id, formData: buildUpdateEventFormData(values) })
				}
			/>
		</Modal>
	);
}
