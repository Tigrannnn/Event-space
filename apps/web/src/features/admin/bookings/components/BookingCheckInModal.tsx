'use client';

import { useState } from 'react';
import { Minus, Plus, Undo2, UserCheck } from 'lucide-react';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button';
import { useModalData, useModalStore } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import { useTranslation } from '@/hooks/translation';
import { useCheckInBooking, useUndoBookingCheckIn } from '@/features/admin/hooks/useAdmin';

const STEP_BUTTON_CLASS_NAME =
	'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700';

export default function BookingCheckInModal() {
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.BookingCheckIn);
	const booking = modalData?.booking;
	const isCheckingIn = modalData?.mode === 'in';

	const checkIn = useCheckInBooking();
	const undoCheckIn = useUndoBookingCheckIn();

	const max = booking ? (isCheckingIn ? booking.quantity - booking.checkedInCount : booking.checkedInCount) : 1;
	const [count, setCount] = useState(isCheckingIn ? max : 1);

	if (!booking) return null;

	const clamp = (value: number) => Math.min(max, Math.max(1, value));
	const mutation = isCheckingIn ? checkIn : undoCheckIn;

	const submit = () => {
		mutation.mutate({ id: booking.id, count }, { onSuccess: closeModal });
	};

	return (
		<Modal onClose={closeModal} size="md" ariaLabel={translate(isCheckingIn ? 'admin.checkInGuests' : 'admin.undoCheckInGuests')}>
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50">
				<ModalHeader
					title={translate(isCheckingIn ? 'admin.checkInGuests' : 'admin.undoCheckInGuests')}
					onClose={closeModal}
				/>

				<div className="space-y-5">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						{translate('admin.checkedInProgress', {
							checked: booking.checkedInCount,
							total: booking.quantity,
						})}
					</p>

					<div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
						<span className="text-sm font-medium text-gray-700 dark:text-gray-200">
							{translate(isCheckingIn ? 'admin.guestsToCheckIn' : 'admin.guestsToUndo')}
						</span>
						<div className="flex items-center gap-2">
							<button
								type="button"
								className={STEP_BUTTON_CLASS_NAME}
								disabled={count <= 1}
								onClick={() => setCount((current) => clamp(current - 1))}
								aria-label="-1"
							>
								<Minus className="h-4 w-4" />
							</button>
							<input
								type="number"
								inputMode="numeric"
								min={1}
								max={max}
								value={count}
								onChange={(event) => setCount(clamp(Number(event.target.value) || 1))}
								onFocus={(event) => event.target.select()}
								className="h-10 w-16 rounded-lg border border-gray-300 bg-white text-center font-bold text-gray-900 outline-none focus:border-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
							/>
							<button
								type="button"
								className={STEP_BUTTON_CLASS_NAME}
								disabled={count >= max}
								onClick={() => setCount((current) => clamp(current + 1))}
								aria-label="+1"
							>
								<Plus className="h-4 w-4" />
							</button>
						</div>
					</div>

					{max > 1 && (
						<div className="flex gap-2">
							<Button type="button" size="xs" variant="secondary" onClick={() => setCount(1)}>
								1
							</Button>
							<Button type="button" size="xs" variant="secondary" onClick={() => setCount(max)}>
								{translate('admin.allGuests', { count: max })}
							</Button>
						</div>
					)}

					<div className="flex justify-end gap-2">
						<Button type="button" size="sm" variant="secondary" onClick={closeModal}>
							{translate('booking.close')}
						</Button>
						<Button
							type="button"
							size="sm"
							variant={isCheckingIn ? 'primary' : 'danger'}
							isLoading={mutation.isPending}
							onClick={submit}
						>
							{isCheckingIn ? <UserCheck className="mr-2 h-4 w-4" /> : <Undo2 className="mr-2 h-4 w-4" />}
							{translate(isCheckingIn ? 'admin.checkInGuestsSubmit' : 'admin.undoCheckInGuestsSubmit', {
								count,
							})}
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
}
