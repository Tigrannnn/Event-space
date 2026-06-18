'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import Button from '@/components/ui/Buttons/Button';
import { formatDateTime } from '@/utils/date';
import { formatBookingReference } from '@/utils/booking';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { Calendar, MapPin, Users, CheckCircle, XCircle } from 'lucide-react';

export default function CheckInForm() {
	const [input, setInput] = useState('');
	const [ref, setRef] = useState<number | null>(null);
	const { addToast } = useToastStore();
	const queryClient = useQueryClient();

	const { data: booking, isLoading, isError } = useQuery({
		queryKey: ['checkin-booking', ref],
		queryFn: () => adminApi.getBookingByReference(ref!).then((r) => r.data),
		enabled: ref !== null,
		retry: false,
	});

	const { mutate: checkIn, isPending: isCheckingIn } = useMutation({
		mutationFn: (id: string) => adminApi.checkInBooking(id),
		onSuccess: () => {
			addToast('Checked in successfully', ToastType.SUCCESS);
			queryClient.invalidateQueries({ queryKey: ['checkin-booking', ref] });
		},
		onError: () => {
			addToast('Failed to check in', ToastType.ERROR);
		},
	});

	const handleSearch = () => {
		const num = parseInt(input.replace('#', '').trim(), 10);
		if (isNaN(num)) {
			addToast('Invalid reference number', ToastType.ERROR);
			return;
		}
		setRef(num);
	};

	const isCheckedIn = !!booking?.checkedInAt;
	const isCancelled = booking?.status === 'CANCELLED';

	return (
		<div className="mx-auto max-w-lg space-y-6">
			<div className="flex gap-2">
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
					placeholder="#100142"
					className="focus:border-primary h-10 flex-1 rounded-md border border-gray-500 bg-transparent px-3 text-sm outline-none placeholder:text-gray-400"
				/>
				<Button onClick={handleSearch} isLoading={isLoading}>
					Find
				</Button>
			</div>

			{isError && (
				<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
					Booking not found
				</div>
			)}

			{booking && (
				<div
					className={`space-y-4 rounded-xl border p-5 ${
						isCancelled
							? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
							: isCheckedIn
							? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
							: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
					}`}>
					<div className="flex items-center justify-between">
						<span className="font-mono text-2xl font-bold text-gray-900 dark:text-white">
							{formatBookingReference(booking.referenceNumber)}
						</span>
						{isCancelled ? (
							<XCircle className="h-6 w-6 text-red-500" />
						) : isCheckedIn ? (
							<CheckCircle className="h-6 w-6 text-yellow-500" />
						) : (
							<CheckCircle className="h-6 w-6 text-green-500" />
						)}
					</div>

					<div>
						<p className="text-lg font-bold text-gray-900 dark:text-white">
							{booking.user?.name ?? 'Unknown'}
						</p>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{booking.user?.email}
						</p>
					</div>

					<div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
						<p className="font-medium text-gray-900 dark:text-white">
							{booking.event?.title ?? '—'}
						</p>
						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							<span>{booking.event ? formatDateTime(booking.event.date) : '—'}</span>
						</div>
						<div className="flex items-center gap-2">
							<MapPin className="h-4 w-4" />
							<span>{booking.event?.location ?? '—'}</span>
						</div>
						<div className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							<span>
								{booking.quantity} {booking.quantity === 1 ? 'spot' : 'spots'}
							</span>
						</div>
					</div>

					{isCancelled && (
						<p className="text-sm font-medium text-red-600 dark:text-red-400">
							Booking cancelled — entry not allowed
						</p>
					)}

					{isCheckedIn && (
						<p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
							Already checked in at {formatDateTime(booking.checkedInAt!)}
						</p>
					)}

					{!isCancelled && !isCheckedIn && (
						<Button
							variant="primary"
							className="w-full"
							onClick={() => checkIn(booking.id)}
							isLoading={isCheckingIn}
						>
							Check In
						</Button>
					)}
				</div>
			)}
		</div>
	);
}
