'use client';

import { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button';
import Input from '@/components/ui/Inputs/Input/Input';
import Select from '@/components/ui/Select';
import { useModalStore } from '@/stores';
import { useTranslation } from '@/hooks/translation';
import { useCreateManualBooking } from '@/features/admin/hooks/useAdmin';
import type { CreateManualBookingData, Event, EventOccurrence } from '@event-space/shared';
import QuantitySelector from '@/features/bookings/components/QuantitySelector';
import EventSearchSelect from '@/features/admin/components/EventSearchSelect';
import UserSearchSelect from '@/features/admin/components/UserSearchSelect';
import { useFormatDate } from '@/hooks/format/useFormatDate';
import {
	buildManualBookingData,
	validateManualBooking,
	type ManualBookingErrors,
	type ManualBookingField,
} from './manual-booking-form';

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
	const [errors, setErrors] = useState<ManualBookingErrors>({});

	const clearErrors = (...fields: ManualBookingField[]) => {
		setErrors((current) => {
			if (!fields.some((field) => current[field])) return current;
			const next = { ...current };
			for (const field of fields) delete next[field];
			return next;
		});
	};

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
				(occurrence) => occurrence.status === 'ACTIVE' && new Date(occurrence.date) > new Date(),
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
		clearErrors('event', 'occurrence');
	};

	const handleOccurrenceSelect = (occurrenceId: string) => {
		const occurrence = avalibleOccurrences.find((occ) => occ.id === occurrenceId) ?? null;
		setSelectedOccurrence(occurrence);
		setFormState((current) => ({
			...current,
			occurrenceId,
		}));
		clearErrors('occurrence');
	};

	const handleSubmit = () => {
		const draft = {
			eventId: selectedEvent?.id,
			hasAvailableDates: avalibleOccurrences.length > 0,
			occurrenceId: formState.occurrenceId,
			quantity: Number(formState.quantity),
			userId: formState.userId,
			name: formState.name,
			phone: formState.phone,
			email: formState.email,
			paymentMethod: formState.paymentMethod,
		};

		const nextErrors = validateManualBooking(draft);
		setErrors(nextErrors);
		if (Object.keys(nextErrors).length > 0) return;

		createManualBooking(buildManualBookingData(draft));
	};

	const renderError = (field: ManualBookingField) => {
		const key = errors[field];
		return key ? <p className="-mt-2 text-xs text-red-500">{translate(key)}</p> : null;
	};

	return (
		<Modal onClose={closeModal} ariaLabel={translate('admin.createManualBooking')} size="md">
			<div className="p-4 sm:p-6">
				<ModalHeader title={translate('admin.createManualBooking')} onClose={closeModal} />

				<div className="grid grid-cols-1 gap-4">
					<EventSearchSelect
						value={selectedEvent?.id ?? ''}
						onChange={handleEventSelect}
						label={translate('admin.eventField')}
					/>
					{renderError('event')}

					{selectedEvent &&
						(avalibleOccurrences.length > 0 ? (
							<>
								<Select
									value={formState.occurrenceId}
									onValueChange={handleOccurrenceSelect}
									className="w-full font-medium"
								>
									<option value="">{translate('admin.selectDate')}</option>
									{avalibleOccurrences.map((occurrence) => (
										<option key={occurrence.id} value={occurrence.id}>
											{formatDateTime(occurrence.date)} —{' '}
											{Math.max(0, occurrence.maxParticipants - occurrence.currentParticipants)}{' '}
											{translate('booking.spotsLeft')}
										</option>
									))}
								</Select>
								{renderError('occurrence')}
							</>
						) : (
							// Shown straight away rather than after submitting: an empty date list with no
							// explanation reads as a broken form.
							<p
								className={
									errors.occurrence ? 'text-xs text-red-500' : 'text-sm text-gray-500 dark:text-gray-400'
								}
							>
								{translate('admin.validation.noAvailableDates')}
							</p>
						))}

					<UserSearchSelect
						label={translate('admin.userField')}
						existingUserId={formState.userId ?? ''}
						newUserName={formState.name ?? ''}
						onExistingUserSelect={(user) => {
							// Only the id is kept for an existing user — see buildManualBookingData.
							setFormState((state) => ({
								...state,
								userId: user?.id || undefined,
								name: undefined,
								phone: undefined,
								email: undefined,
							}));
							clearErrors('user', 'phone', 'email');
						}}
						onNewUserName={(name) => {
							setFormState((state) => ({ ...state, name: name || undefined, userId: undefined }));
							clearErrors('user');
						}}
					/>
					{renderError('user')}

					{/* Contact details belong to a new user; an existing one already has them. */}
					{!formState.userId && (
						<>
							<Input
								label={translate('admin.phoneField')}
								value={formState.phone ?? ''}
								onChange={(e) => {
									handleChange('phone', e.target.value);
									clearErrors('phone');
								}}
								placeholder={translate('admin.phonePlaceholder')}
								className="h-10 w-full rounded-md border bg-transparent px-3 text-sm font-medium outline-none"
							/>
							{renderError('phone')}

							<Input
								label={translate('admin.emailField')}
								value={formState.email ?? ''}
								onChange={(e) => {
									handleChange('email', e.target.value);
									clearErrors('email');
								}}
								placeholder={translate('admin.emailPlaceholder')}
								className="h-10 w-full rounded-md border bg-transparent px-3 text-sm font-medium outline-none"
							/>
							{renderError('email')}
						</>
					)}

					<Select
						value={formState.paymentMethod}
						onValueChange={(value) => handleChange('paymentMethod', value)}
						className="w-full font-medium"
					>
						<option value="OFFLINE_PAID">{translate('admin.payment.offline')}</option>
						<option value="PAY_ON_ARRIVAL">{translate('admin.payment.onArrival')}</option>
					</Select>

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
