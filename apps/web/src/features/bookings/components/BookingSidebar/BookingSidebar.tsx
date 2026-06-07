import { useMemo } from 'react';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import Button from '@/components/ui/Buttons/Button';
import { CheckIcon } from '../../../../components/ui/Icons';
import { Event } from '@event-space/shared';
import { formatDateTime } from '@/utils/date';
import { ModalType, useModalStore } from '@/stores/modalStore';
import { useCurrentUser } from '@/features/users';
import { useGetMyBookings } from '@/features/bookings/hooks/useBookings';
import { useRouter } from 'next/navigation';

export interface BookingSidebarProps {
	event: Event;
}

export default function BookingSidebar({ event }: BookingSidebarProps) {
	const progressPercentage = Math.min(
		100,
		(event.currentParticipants / event.maxParticipants) * 100,
	);
	const spotsLeft = Math.max(0, event.maxParticipants - event.currentParticipants);

	const { openModal } = useModalStore();
	const router = useRouter();

	const { data: user } = useCurrentUser();
	const { data: myBookings } = useGetMyBookings();

	const hasBooking = useMemo(
		() =>
			myBookings?.some((booking) => booking.eventId === event.id && booking.status !== 'CANCELLED'),
		[myBookings, event.id],
	);

	const handleJoinClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		if (user) {
			openModal(ModalType.CreateBooking, { event });
		} else {
			openModal(ModalType.Register);
		}
	};

	const handleViewBooking = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		router.push('/bookings');
	};
	return (
		<div className="sticky top-10">
			<div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xl sm:rounded-[2.5rem] sm:p-6 md:p-8 dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50">
				{/* Price */}
				<div className="mb-5 sm:mb-6">
					<div className="flex items-baseline gap-2">
						<span className="text-primary text-3xl font-black sm:text-4xl">${event.price}</span>
						<span className="font-medium text-gray-500 dark:text-gray-400">/ person</span>
					</div>
				</div>

				{/* Progress Bar */}
				<div className="mb-5 sm:mb-6">
					<div className="mb-2 flex justify-between text-[13px] sm:text-sm">
						<span className="font-bold text-gray-700 dark:text-gray-300">
							{event.currentParticipants} of {event.maxParticipants} participants
						</span>
						<span className="text-accent font-bold">{spotsLeft} spots left</span>
					</div>
					<div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 sm:h-2.5 dark:bg-gray-700">
						<div
							className="from-primary to-accent h-3 rounded-full bg-linear-to-r transition-all duration-500 sm:h-2.5"
							style={{ width: `${progressPercentage}%` }}
						/>
					</div>
					{spotsLeft <= 5 && (
						<p className="text-accent mt-2 animate-pulse text-xs font-bold">⚠️ Selling fast!</p>
					)}
				</div>

				{/* Date & Time Info */}
				<div className="mb-6 space-y-2.5 sm:mb-8 sm:space-y-3">
					<div className="flex items-center gap-2.5 rounded-xl bg-gray-50 p-3 sm:gap-3 sm:rounded-2xl sm:p-4 dark:bg-gray-700/50">
						<Calendar className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
						<div className="flex flex-col">
							<span className="text-[13px] font-medium text-gray-500 uppercase sm:text-xs dark:text-gray-400">
								Date
							</span>
							<span className="text-sm font-bold text-gray-800 sm:text-base dark:text-gray-200">
								{formatDateTime(event.date)}
							</span>
						</div>
					</div>
					<div className="flex items-center gap-2.5 rounded-xl bg-gray-50 p-3 sm:gap-3 sm:rounded-2xl sm:p-4 dark:bg-gray-700/50">
						<MapPin className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
						<div className="flex flex-col">
							<span className="text-[13px] font-medium text-gray-500 uppercase sm:text-xs dark:text-gray-400">
								Location
							</span>
							{event.locationUrl ? (
								<a
									href={event.locationUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-primary text-sm font-medium underline underline-offset-2 transition-colors sm:text-base"
								>
									{event.location}
								</a>
							) : (
								<span className="text-sm font-medium sm:text-base">{event.location}</span>
							)}
						</div>
					</div>
				</div>

				{/* Join Button */}
				{hasBooking ? (
					<Button
						variant="secondary"
						className="w-full py-4 text-base sm:py-5 sm:text-lg"
						onClick={handleViewBooking}
					>
						<Ticket className="h-5 w-5" />
						View My Booking
					</Button>
				) : (
					<Button
						variant="primary"
						className="w-full py-4 text-base sm:py-5 sm:text-lg"
						onClick={handleJoinClick}
					>
						Book Tour
					</Button>
				)}

				{/* Trust badges */}
				<div className="mt-4 flex items-center justify-center gap-3 text-[13px] text-gray-400 sm:mt-6 sm:gap-4 sm:text-xs dark:text-gray-500">
					<div className="flex items-center gap-1">
						<CheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
						<span>Secure booking</span>
					</div>
				</div>
			</div>
		</div>
	);
}
