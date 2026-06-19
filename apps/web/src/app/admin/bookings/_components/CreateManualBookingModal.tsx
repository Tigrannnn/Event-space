'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button';
import Input from '@/components/ui/Inputs/Input/Input';
import { useModalStore } from '@/stores';
import { useI18nStore } from '@/stores/i18n';
import { useCreateManualBooking } from '@/features/admin/hooks/useAdmin';
import type { CreateManualBookingData } from '@event-space/shared';
import EventSearchSelect from '@/features/admin/components/EventSearchSelect';
import UserSearchSelect from '@/features/admin/components/UserSearchSelect';

export default function CreateManualBookingModal() {
	const { translate } = useI18nStore();
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

		if (!data.eventId) {
			setError(translate('admin.invalidReference'));
			return;
		}

		if (!data.userId && !data.shadowUserName) {
			setError('Please select an existing user or enter a name for a new user');
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
				<ModalHeader title={translate('admin.createManualBooking')} onClose={closeModal} />

				<div className="grid gap-4">
					<EventSearchSelect
						value={formState.eventId}
						onChange={(eventId) => handleChange('eventId', eventId)}
						label="Event"
					/>

					<UserSearchSelect
						label="User"
						existingUserId={formState.userId ?? ''}
						newUserName={formState.shadowUserName ?? ''}
						onExistingUserSelect={(userId) =>
							setFormState((s) => ({ ...s, userId: userId || undefined, shadowUserName: undefined }))
						}
						onNewUserName={(name) =>
							setFormState((s) => ({ ...s, shadowUserName: name || undefined, userId: undefined }))
						}
					/>

					<Input
						label="Quantity"
						type="number"
						min={1}
						value={formState.quantity}
						onChange={(event) => handleChange('quantity', Number(event.target.value))}
						placeholder="Number of spots"
						className="h-10 w-full font-medium bg-transparent border border-gray-500 rounded-md px-3 text-sm focus:border-primary transition outline-none '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'"
					/>

					{error && <p className="text-sm text-red-500">{error}</p>}
				</div>

				<div className="mt-6 flex flex-col gap-3 sm:flex-row">
					<Button onClick={closeModal} variant="secondary" size="md" disabled={isPending}>
						{translate('admin.reset')}
					</Button>
					<Button onClick={handleSubmit} variant="primary" size="md" isLoading={isPending}>
						{translate('admin.createManualBooking')}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
