'use client';

import { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button';
import Input from '@/components/ui/Inputs/Input/Input';
import { useModalStore } from '@/stores';
import { useTranslation } from '@/hooks/translation';
import { useCreateManualBooking } from '@/features/admin/hooks/useAdmin';
import type { CreateManualBookingData, Event, EventOccurrence } from '@event-space/shared';
import EventSearchSelect from '@/features/admin/components/EventSearchSelect';
import UserSearchSelect from '@/features/admin/components/UserSearchSelect';
import { useFormatDate } from '@/hooks/format/useFormatDate';

export default function CreateManualBookingModal() {
	const { formatDateTime } = useFormatDate()
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const { mutate: createManualBooking, isPending } = useCreateManualBooking();
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
	const [selectedOccurrence, setSelectedOccurrence] = useState<EventOccurrence | null>(null);
	const [formState, setFormState] = useState<CreateManualBookingData>({
		quantity: 1,
		occurrenceId: '',
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

	const futureOccurrences = useMemo(
		() =>
			(selectedEvent?.occurrences ?? []).filter(
				(occurrence) => new Date(occurrence.date) > new Date(),
			),
		[selectedEvent],
	);

	const handleEventSelect = (_eventId: string, event: Event) => {
		setSelectedEvent(event);
		setSelectedOccurrence(null);
		setFormState((current) => ({
			...current,
			occurrenceId: '',
		}));
	};

	const handleOccurrenceSelect = (occurrenceId: string) => {
		const occurrence = futureOccurrences.find((occ) => occ.id === occurrenceId) ?? null;
		setSelectedOccurrence(occurrence);
		setFormState((current) => ({
			...current,
			occurrenceId,
		}));
	};

	const handleSubmit = () => {
		const data: CreateManualBookingData = {
			occurrenceId: String(formState.occurrenceId),
			quantity: Number(formState.quantity),
			userId: formState.userId?.trim() || undefined,
			shadowUserName: formState.shadowUserName?.trim() || undefined,
		};

		if (!data.occurrenceId) {
			setError(translate('admin.invalidReference'));
			return;
		}

		if (!data.userId && !data.shadowUserName) {
			setError(translate('admin.enterShadowUserName'));
			return;
		}

		if (data.userId && data.shadowUserName) {
			setError(translate('admin.enterShadowUserName'));
			return;
		}

		setError(null);
		createManualBooking(data);
	};

	return (
		<Modal onClose={closeModal} ariaLabel={translate('admin.createManualBooking')} size="md">
			<div className="p-5 sm:p-6">
				<ModalHeader title={translate('admin.createManualBooking')} onClose={closeModal} />

				<div className="grid gap-4">
					<EventSearchSelect
						value={selectedEvent?.id ?? ''}
						onChange={handleEventSelect}
						label={translate('admin.eventField')}
					/>

					<select
						value={formState.occurrenceId}
						onChange={(event) => handleOccurrenceSelect(event.target.value)}
						className="h-10 w-full rounded-md border border-gray-500 bg-transparent px-3 text-sm font-medium outline-none"
						disabled={!selectedEvent}
					>
						<option value="">{translate('admin.selectEvent')}</option>
						{futureOccurrences.map((occurrence) => (
							<option key={occurrence.id} value={occurrence.id}>
								{formatDateTime(occurrence.date)} —{' '}
								{Math.max(0, occurrence.maxParticipants - occurrence.currentParticipants)}{' '}
								{translate('booking.spotsLeft')}
							</option>
						))}
					</select>

					<UserSearchSelect
						label={translate('admin.userField')}
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
						label={translate('admin.quantityField')}
						type="number"
						min={1}
						value={formState.quantity}
						onChange={(event) => handleChange('quantity', Number(event.target.value))}
						placeholder={translate('admin.numberOfSpots')}
						className="focus:border-primary '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none' h-10 w-full rounded-md border bg-transparent px-3 text-sm font-medium transition outline-none [&::-webkit-outer-spin-button]:appearance-none"
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
