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
import QuantitySelector from '@/features/bookings/components/QuantitySelector';
import EventSearchSelect from '@/features/admin/components/EventSearchSelect';
import UserSearchSelect from '@/features/admin/components/UserSearchSelect';
import { useFormatDate } from '@/hooks/format/useFormatDate';


export default function CreateManualBookingModal() {
	const { formatDateTime } = useFormatDate();
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const { mutate: createManualBooking, isPending } = useCreateManualBooking();
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
	const [selectedOccurrence, setSelectedOccurrence] = useState<EventOccurrence | null>(null);
	const [formState, setFormState] = useState<CreateManualBookingData>({
		quantity: 1,
		occurrenceId: '',
		userId: undefined,
		name: undefined,
		phone: undefined,
		email: undefined,
		paymentMethod: 'OFFLINE_PAID',
	});
	const [error, setError] = useState<string | null>(null);

	const handleChange = (
		field: keyof CreateManualBookingData,
		value: string | number | undefined,
	) => {
		setFormState((current) => ({
			...current,
			[field]: value,
		}));
	};

	const avalibleOccurrences = useMemo(
		() =>
			(selectedEvent?.occurrences ?? []).filter(
				(occurrence) => occurrence.status === 'ACTIVE' && new Date(occurrence.date) > new Date() ,
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
		const occurrence = avalibleOccurrences.find((occ) => occ.id === occurrenceId) ?? null;
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
			name: formState.name?.trim() || undefined,
			phone: formState.phone?.trim() || undefined,
			email: formState.email?.trim() || undefined,
			paymentMethod: formState.paymentMethod || 'OFFLINE_PAID',
		};

		if (!data.occurrenceId) {
			setError(translate('admin.invalidReference'));
			return;
		}

		if (!data.userId && !data.name) {
			setError(translate('admin.enterShadowUserName'));
			return;
		}

		if (data.userId && data.name) {
			setError(translate('admin.enterShadowUserName'));
			return;
		}

		// If creating a shadow user, phone is required
		if (data.name && !data.phone) {
			setError(translate('admin.enterPhoneForShadowUser'));
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

					{selectedEvent && (
						<select
							value={formState.occurrenceId}
							onChange={(event) => handleOccurrenceSelect(event.target.value)}
								className="h-10 w-full rounded-md border border-gray-500 bg-transparent px-3 text-sm font-medium outline-none"
							>
								<option value="">{translate('admin.selectEvent')}</option>
								{avalibleOccurrences.map((occurrence) => (
									<option key={occurrence.id} value={occurrence.id}>
										{formatDateTime(occurrence.date)} —{' '}
										{Math.max(0, occurrence.maxParticipants - occurrence.currentParticipants)}{' '}
										{translate('booking.spotsLeft')}
									</option>
								))}
							</select>
					)}

					<UserSearchSelect
						label={translate('admin.userField')}
						existingUserId={formState.userId ?? ''}
						newUserName={formState.name ?? ''}
						onExistingUserSelect={(user) =>
							setFormState((state) => ({
								...state,
								phone: user?.phone || undefined,
								userId: user?.id || undefined,
								name: user?.name || undefined,
								email: user?.email || undefined,
							}))
						}
						onNewUserName={(name) =>
							setFormState((state) => ({ ...state, name: name || undefined, userId: undefined }))
						}
					/>

					<Input
						label={translate('admin.phoneField')}
						value={formState.phone ?? ''}
						onChange={(e) => handleChange('phone', e.target.value)}
						placeholder={translate('admin.phonePlaceholder')}
						className="h-10 w-full rounded-md border bg-transparent px-3 text-sm font-medium outline-none"
					/>

					<Input
						label={translate('admin.emailField')}
						value={formState.email ?? ''}
						onChange={(e) => handleChange('email', e.target.value)}
						placeholder={translate('admin.emailPlaceholder')}
						className="h-10 w-full rounded-md border bg-transparent px-3 text-sm font-medium outline-none"
					/>

					<select
						value={formState.paymentMethod}
						onChange={(e) => handleChange('paymentMethod', e.target.value)}
						className="h-10 w-full rounded-md border border-gray-500 bg-transparent px-3 text-sm font-medium outline-none"
					>
						<option value="OFFLINE_PAID">{translate('admin.payment.offline')}</option>
						<option value="PAY_ON_ARRIVAL">{translate('admin.payment.onArrival')}</option>
					</select>

					{selectedOccurrence && (
						<QuantitySelector
							quantity={Number(formState.quantity)}
							maxQuantity={Math.max(
								1,
								selectedOccurrence.maxParticipants - selectedOccurrence.currentParticipants,
							)}
							onIncrement={() => handleChange('quantity', Number(formState.quantity) + 1)}
							onDecrement={() => handleChange('quantity', Math.max(1, Number(formState.quantity) - 1))}
							label={translate('admin.numberOfSpots')}
						/>
					)}

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
