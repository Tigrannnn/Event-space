'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button';
import Input from '@/components/ui/Inputs/Input/Input';
import { useModalStore } from '@/stores';
import { ModalType } from '@/stores';
import { useCreateManualBooking } from '@/features/admin/hooks/useAdmin';
import type { CreateManualBookingData } from '@event-space/shared';

const initialFormState = {
	quantity: 1,
	eventId: '',
	userId: '',
	shadowUserName: '',
};

export default function CreateManualBookingModal() {
	const { closeModal } = useModalStore();
	const { mutate: createManualBooking, isPending } = useCreateManualBooking();
	const [formState, setFormState] = useState<CreateManualBookingData>({
		quantity: 1,
		eventId: '',
		userId: undefined,
		shadowUserName: undefined,
	});
	const [error, setError] = useState<string | null>(null);

	const handleChange = (field: keyof CreateManualBookingData, value: string | number) => {
		setFormState((current) => ({
			...current,
			[field]: value,
		}));
	};

	const handleSubmit = () => {
		const data: CreateManualBookingData = {
			eventId: String(formState.eventId),
			quantity: Number(formState.quantity),
			userId: formState.userId?.trim() || undefined,
			shadowUserName: formState.shadowUserName?.trim() || undefined,
		};

		if (!data.userId && !data.shadowUserName) {
			setError('Provide user ID or shadow user name');
			return;
		}

		if (data.userId && data.shadowUserName) {
			setError('Provide only one of user ID or shadow user name');
			return;
		}

		setError(null);
		createManualBooking(data);
	};

	return (
		<Modal onClose={closeModal} ariaLabel="Create manual booking" size="md">
			<div className="p-5 sm:p-6">
				<ModalHeader title="Create manual booking" onClose={closeModal} />

				<div className="grid gap-4">
					<Input
						label="Event ID"
						value={formState.eventId}
						onChange={(event) => handleChange('eventId', event.target.value)}
						placeholder="Enter event id"
					/>

					<Input
						label="Quantity"
						type="number"
						min={1}
						value={formState.quantity}
						onChange={(event) => handleChange('quantity', Number(event.target.value))}
						placeholder="Number of spots"
					/>

					<Input
						label="Existing user ID"
						value={formState.userId ?? ''}
						onChange={(event) => handleChange('userId', event.target.value)}
						placeholder="Optional existing user id"
					/>

					<Input
						label="Shadow user name"
						value={formState.shadowUserName ?? ''}
						onChange={(event) => handleChange('shadowUserName', event.target.value)}
						placeholder="Optional shadow user name"
					/>

					{error && <p className="text-sm text-red-500">{error}</p>}
				</div>

				<div className="mt-6 flex flex-col gap-3 sm:flex-row">
					<Button onClick={closeModal} variant="secondary" size="md" disabled={isPending}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} variant="primary" size="md" isLoading={isPending}>
						Create booking
					</Button>
				</div>
			</div>
		</Modal>
	);
}
