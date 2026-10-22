'use client';

import { useState, type FormEvent } from 'react';
import { CalendarClock } from 'lucide-react';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button/Button';
import DateTimeField from '../EventForm/DateTimeField';
import { useModalStore, useModalData } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import { useTranslation } from '@/hooks/translation';
import { useRescheduleOccurrence } from '@/features/admin/hooks/useAdmin';
import { zonedLocalInputToDate } from '@event-space/shared';

const inputClassName =
	'focus:border-primary w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white';

export default function RescheduleOccurrenceModal() {
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.RescheduleOccurrence);

	const reschedule = useRescheduleOccurrence();
	const [date, setDate] = useState(modalData?.date ?? '');

	if (!modalData) {
		return null;
	}

	const changed = Boolean(date) && date !== modalData.date;

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!changed) return;

		const moment = zonedLocalInputToDate(date);
		if (!moment) return;

		await reschedule.mutateAsync({
			occurrenceId: modalData.occurrenceId,
			date: moment.toISOString(),
		});

		// The event form still holds the old date; saving it afterwards would try to move the
		// date back through a path that refuses to move booked dates at all.
		modalData.onRescheduled(date);
		closeModal();
	};

	return (
		<Modal onClose={closeModal} size="md" ariaLabel="Reschedule occurrence">
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50">
				<ModalHeader title={translate('admin.rescheduleOccurrence')} onClose={closeModal} />

				<form onSubmit={handleSubmit} className="space-y-5">
					{modalData.eventTitle && (
						<div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
							<p className="text-sm font-medium text-gray-900 dark:text-white">
								{modalData.eventTitle}
							</p>
							<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
								{translate('admin.activeBookings')} {modalData.activeBookingsCount}
							</p>
						</div>
					)}

					<p className="rounded-xl border border-amber-500 bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
						{translate('admin.rescheduleWarning')}
					</p>

					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700 dark:text-gray-200">
							{translate('admin.rescheduleNewDate')}
						</label>
						<DateTimeField
							value={date}
							onChange={setDate}
							disabled={reschedule.isPending}
							inputClassName={inputClassName}
						/>
					</div>

					<div className="flex justify-end gap-2">
						<Button type="button" size="sm" variant="secondary" onClick={closeModal}>
							{translate('booking.close')}
						</Button>
						<Button type="submit" size="sm" disabled={!changed} isLoading={reschedule.isPending}>
							<CalendarClock className="mr-2 h-4 w-4" />
							{translate('admin.rescheduleOccurrence')}
						</Button>
					</div>
				</form>
			</div>
		</Modal>
	);
}
