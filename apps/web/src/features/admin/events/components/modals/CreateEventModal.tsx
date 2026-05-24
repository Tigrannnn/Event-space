'use client';

import { useCreateEvent } from '@/features/admin/hooks/useAdmin';
import EventForm from '../EventForm';
import { buildCreateEventFormData } from '../EventForm/form-mappers';
import type { EventFormValues } from '@event-space/shared';
import { useModalStore } from '@/stores';
import { Modal } from '@/components/ui/Modal';

export default function CreateEventModal() {
	const { closeModal } = useModalStore();
	const { mutateAsync: createEvent, isPending } = useCreateEvent();

	return (
		<Modal
			onClose={closeModal}
			size="full"
			position="center"
			ariaLabel="Create Event Modal"
			disableBackdropClose={isPending}
			disableEscapeClose={isPending}
		>
			<EventForm
				isPending={isPending}
				submitLabel={isPending ? 'Creating...' : 'Create event'}
				onCancel={closeModal}
				event={undefined}
				onSubmit={(values: EventFormValues) => createEvent(buildCreateEventFormData(values))}
			/>
		</Modal>
	);
}
