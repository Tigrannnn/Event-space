'use client';

import Link from 'next/link';
import Button from '@/components/ui/Buttons/Button';
import { formatDateTime } from '@/utils/date';
import { Calendar, MapPin, Users } from 'lucide-react';
import type { BookingCardProps } from './types';
import { useConfirm } from '@/hooks/confirmModal';
import { useCancelBooking } from '../../hooks/useBookings';
import { EventImageFallback } from '@/features/events';
import { useModalStore } from '@/stores';
import { ModalType } from '@/stores/modalStore';

export default function BookingCard({ booking }: BookingCardProps) {
	const { event, quantity, status } = booking;
	const { mutate: cancelBooking } = useCancelBooking();
	const { openModal } = useModalStore();

	const confirm = useConfirm();

	const handleUpdate = () => {
		openModal(ModalType.UpdateBooking, { booking });
	};

	const handleCancel = async () => {
		const isConfirmed = await confirm({
			title: 'Cancel Booking',
			message: 'Are you sure you want to cancel this booking?',
			confirmText: 'Yes, Cancel',
			cancelText: 'Cancel',
			variant: 'danger',
		});

		if (isConfirmed) {
			cancelBooking(booking.id);
		}
	};

	if (!event) return null;

	return (
		<div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
			{/* Event Image */}
			<div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
				{event.images[0] ? (
					<img
						src={event.images[0]}
						alt={event.title}
						className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
					/>
				) : (
					<EventImageFallback alt={event.title} />
				)}

				{/* Status Badge */}
				<span
					className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold uppercase ${
						status === 'CONFIRMED'
							? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
							: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
					}`}
				>
					{status}
				</span>
			</div>

			{/* Content */}
			<div className="p-4 sm:p-6">
				<Link
					href={`/events/${event.id}`}
					className="hover:text-primary dark:hover:text-primary mb-2 block text-lg font-bold text-gray-900 transition-colors sm:text-xl dark:text-white"
				>
					{event.title}
				</Link>

				<div className="mb-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
					<div className="flex items-center gap-2">
						<Calendar className="h-4 w-4" />
						<span>{formatDateTime(event.date)}</span>
					</div>
					<div className="flex items-center gap-2">
						<MapPin className="h-4 w-4" />
						<span>{event.location}</span>
					</div>
				</div>

				{/* Quantity & Price */}
				<div className="mb-4 flex items-center justify-between border-t border-b border-gray-100 py-3 dark:border-gray-700">
					<div className="flex items-center gap-2">
						<Users className="text-primary h-5 w-5" />
						<span className="font-medium text-gray-700 dark:text-gray-300">
							{quantity} {quantity === 1 ? 'spot' : 'spots'}
						</span>
					</div>
					<div className="text-right">
						<span className="text-primary text-xl font-bold">${event.price * quantity}</span>
						<span className="text-sm text-gray-400 dark:text-gray-500"> total</span>
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-2">
					<Button variant="primary" size="sm" className="flex-1" onClick={handleUpdate}>
						Update
					</Button>
					<Button variant="danger" size="sm" className="flex-1" onClick={handleCancel}>
						Cancel
					</Button>
				</div>
			</div>
		</div>
	);
}
