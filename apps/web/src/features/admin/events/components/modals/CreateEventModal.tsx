'use client';

import { useCreateEvent } from '@/features/admin/hooks/useAdmin';
import EventForm from '../EventForm';
import { buildCreateEventFormData } from '../EventForm/form-mappers';
import type { EventFormValues } from '../EventForm/event-form.schema';
import { useModalStore } from '@/stores';
import { Modal } from '@/components/ui/Modal';
import { useTranslation } from '@/hooks/translation';

export default function CreateEventModal() {
	const { closeModal } = useModalStore();
	const { mutateAsync: createEvent, isPending } = useCreateEvent();
	const translate = useTranslation();

	return (
		<Modal
			onClose={closeModal}
			size="full"
			position="center"
			ariaLabel={translate('admin.createEventModal')}
			disableBackdropClose={true}
			disableEscapeClose={true}
		>
			<EventForm
				isPending={isPending}
				submitLabel={isPending ? translate('admin.creating') : translate('admin.createEvent')}
				onCancel={closeModal}
				event={undefined}
				onSubmit={(values: EventFormValues) => createEvent(buildCreateEventFormData(values))}
			/>
		</Modal>
	);
}
