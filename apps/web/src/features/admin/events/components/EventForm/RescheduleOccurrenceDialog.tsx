'use client';

import { useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button/Button';
import DateTimeField from '@/components/ui/DateTimeField';
import CancellationReasonField from './CancellationReasonField';
import { useTranslation } from '@/hooks/translation';
import { useRescheduleOccurrence } from '@/features/admin/hooks/useAdmin';
import { zonedLocalInputToDate, type CancellationReasons } from '@event-space/shared';

interface RescheduleOccurrenceDialogProps {
	occurrenceId: string;
	currentDate: string;
	eventTitle?: string;
	activeBookingsCount: number;
	inputClassName: string;
	onClose: () => void;
	onRescheduled: (date: string) => void;
}

export default function RescheduleOccurrenceDialog({
	occurrenceId,
	currentDate,
	eventTitle,
	activeBookingsCount,
	inputClassName,
	onClose,
	onRescheduled,
}: RescheduleOccurrenceDialogProps) {
	const translate = useTranslation();
	const reschedule = useRescheduleOccurrence();
	const [date, setDate] = useState(currentDate);
	const [reasons, setReasons] = useState<CancellationReasons>({});
	const [noReason, setNoReason] = useState(false);

	const changed = Boolean(date) && date !== currentDate;

	const handleReschedule = async () => {
		const moment = zonedLocalInputToDate(date);
		if (!moment) return;

		await reschedule.mutateAsync({
			occurrenceId,
			date: moment.toISOString(),
			reasons: noReason ? undefined : reasons,
		});

		onRescheduled(date);
		onClose();
	};

	return (
		<Modal
			onClose={onClose}
			ariaLabel={translate('admin.rescheduleOccurrence')}
			position="center"
			contentClassName="p-5 sm:p-8"
			disableEscapeClose={reschedule.isPending}
			disableBackdropClose={reschedule.isPending}
		>
			<ModalHeader title={translate('admin.rescheduleOccurrence')} onClose={onClose} />

			<div className="mt-2 space-y-4">
				{eventTitle && (
					<div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
						<p className="text-sm font-medium text-gray-900 dark:text-white">{eventTitle}</p>
						<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
							{translate('admin.activeBookings')} {activeBookingsCount}
						</p>
					</div>
				)}

				<p className="rounded-xl border border-amber-500 bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
					{translate('admin.rescheduleWarning')}
				</p>

				<div className="space-y-1.5">
					<span className="text-xs font-medium text-gray-500">
						{translate('admin.rescheduleNewDate')}
					</span>
					<DateTimeField
						value={date}
						onChange={setDate}
						disabled={reschedule.isPending}
						inputClassName={inputClassName}
					/>
				</div>

				<CancellationReasonField
					reasons={reasons}
					noReason={noReason}
					disabled={reschedule.isPending}
					noReasonHint={translate('admin.rescheduleReasonNoneHint')}
					onReasonsChange={setReasons}
					onNoReasonChange={setNoReason}
				/>
			</div>

			<div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row">
				<Button type="button" variant="secondary" onClick={onClose} disabled={reschedule.isPending}>
					{translate('event.back')}
				</Button>
				<Button
					type="button"
					onClick={handleReschedule}
					disabled={!changed}
					isLoading={reschedule.isPending}
				>
					<CalendarClock className="mr-2 h-4 w-4" />
					{translate('admin.rescheduleOccurrence')}
				</Button>
			</div>
		</Modal>
	);
}
