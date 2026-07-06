'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Calendar, MapPin, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Button from '@/components/ui/Buttons/Button';
import Select from '@/components/ui/Select';
import { CheckIcon } from '../../../../components/ui/Icons';
import {
	Event,
	isEventAvailable,
	getEventTranslation,
	getUpcomingEventOccurrences,
} from '@event-space/shared';
import { useCurrentUser } from '@/features/users';
import { useGetMyBookings } from '@/features/bookings/hooks/useBookings';
import { Skeleton } from '@/components/ui/Skeleton';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { useTranslation } from '@/hooks/translation';
import { formatCurrency } from '@/utils/currency';
import { ModalType, useModalStore } from '@/stores';
import React from 'react';

export interface BookingSidebarProps {
	event: Event;
}

export default function BookingSidebar({ event }: BookingSidebarProps) {
	const router = useRouter();
	const navigation = useLocalizedNavigation();
	const translate = useTranslation();
	const locale = translate.locale;
	const t = getEventTranslation(event, locale);
	const [selectedOccId, setSelectedOccId] = useState<string | undefined>(undefined);

	const upcomingOccurrences = useMemo(() => getUpcomingEventOccurrences(event), [event]);
	const selectedOccurrence = useMemo(
		() =>
			upcomingOccurrences.find((occurrence) => occurrence.id === selectedOccId) ??
			upcomingOccurrences[0],
		[upcomingOccurrences, selectedOccId],
	);

	const { openModal } = useModalStore();

	const currentParticipants = Number(selectedOccurrence?.currentParticipants ?? 0);
	const maxParticipants = Number(selectedOccurrence?.maxParticipants ?? 0);
	const progressPercentage =
		maxParticipants > 0 ? Math.min(100, (currentParticipants / maxParticipants) * 100) : 0;
	const spotsLeft = Math.max(0, maxParticipants - currentParticipants);
	const isSoldOut = maxParticipants > 0 && currentParticipants >= maxParticipants;

	const { data: user, isLoading: isUserLoading } = useCurrentUser();
	const { data: myBookings, isLoading: isMyBookingsLoading } = useGetMyBookings();

	const hasBooking = useMemo(() => {
		if (!selectedOccurrence?.id || !myBookings?.length) return false;

		return myBookings.some((booking) => {
			const status = booking.status?.toUpperCase();
			if (status !== 'CONFIRMED') return false;

			const bookingOccurrenceId = booking.occurrenceId ?? booking.occurrence?.id;
			return bookingOccurrenceId === selectedOccurrence.id;
		});
	}, [myBookings, selectedOccurrence?.id]);

	useEffect(() => {
		if (!upcomingOccurrences.length) {
			setSelectedOccId(undefined);
			return;
		}

		setSelectedOccId((prev) => {
			if (prev && upcomingOccurrences.some((occurrence) => occurrence.id === prev)) {
				return prev;
			}
			return upcomingOccurrences[0]?.id;
		});
	}, [upcomingOccurrences]);

	const handleBookClick = (e: React.MouseEvent) => {
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
		navigation.push('/bookings');
	};

	const eventIsAvailable = isEventAvailable(event);

	if (!upcomingOccurrences.length) {
		return (
			<div className="sticky top-10">
				<div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xl sm:rounded-[2.5rem] sm:p-6 md:p-8 dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50">
					<div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800/70">
						<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
							{translate('event.noUpcomingOccurrences')}
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="sticky top-10">
			<div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xl sm:rounded-[2.5rem] sm:p-6 md:p-8 dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50">
				{/* Price */}
				<div className="mb-5 sm:mb-6">
					<div className="flex items-baseline gap-2">
						<span className="text-primary text-3xl font-black sm:text-4xl">
							{formatCurrency(event.price)}
						</span>
						<span className="font-medium text-gray-500 dark:text-gray-400">
							{translate('event.perPerson')}
						</span>
					</div>
				</div>

				{/* Progress Bar */}
				<div className="mb-5 sm:mb-6">
					<div className="mb-2 flex justify-between gap-3 text-[13px] sm:text-sm">
						<span className="font-bold text-gray-700 dark:text-gray-300">
							{currentParticipants} / {maxParticipants} {translate('event.participants')}
						</span>
						<span className="text-primary font-bold dark:text-emerald-400">
							{spotsLeft} {translate('event.spotsLeft')}
						</span>
					</div>
					<div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 sm:h-2.5 dark:bg-gray-700">
						<div
							className="from-primary to-accent h-3 rounded-full bg-linear-to-r transition-all duration-500 ease-in-out sm:h-2.5"
							style={{ width: `${progressPercentage}%` }}
						/>
					</div>
					{spotsLeft <= 5 && (
						<p className="text-accent mt-2 animate-pulse text-xs font-bold">
							{translate('event.sellingFast')}
						</p>
					)}
				</div>

				{/* Date & Time Info */}
				<div className="mb-6 space-y-2.5 sm:mb-8 sm:space-y-3">
					<div className="flex items-center gap-2.5 rounded-xl bg-gray-50 p-3 sm:gap-3 sm:rounded-2xl sm:p-4 dark:bg-gray-700/50">
						<Calendar className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
						<div className="flex w-full flex-col gap-2">
							<span className="text-[13px] font-medium text-gray-500 uppercase sm:text-xs dark:text-gray-400">
								{translate('event.date')}
							</span>
							<Select
								value={selectedOccurrence?.id ?? ''}
								onValueChange={setSelectedOccId}
								className="focus:border-primary w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm transition focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
							>
								{upcomingOccurrences.map((occurrence) => (
									<option key={occurrence.id} value={occurrence.id}>
										{format(new Date(occurrence.date ?? new Date()), 'd MMM., HH:mm', { locale: ru })}
									</option>
								))}
							</Select>
						</div>
					</div>
					<div className="flex items-center gap-2.5 rounded-xl bg-gray-50 p-3 sm:gap-3 sm:rounded-2xl sm:p-4 dark:bg-gray-700/50">
						<MapPin className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
						<div className="flex flex-col">
							<span className="text-[13px] font-medium text-gray-500 uppercase sm:text-xs dark:text-gray-400">
								{translate('event.location')}
							</span>
							{event.locationUrl ? (
								<a
									href={event.locationUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-primary text-sm font-medium underline underline-offset-2 transition-colors sm:text-base"
								>
									{t.location}
								</a>
							) : (
								<span className="text-sm font-medium sm:text-base">{t.location}</span>
							)}
						</div>
					</div>
				</div>

				{/* Join Button */}
				{!eventIsAvailable ? (
					<div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-700 dark:border-red-700/40 dark:bg-red-900/20 dark:text-red-200">
						{translate('event.eventEnded')}
					</div>
				) : isUserLoading || isMyBookingsLoading ? (
					<Skeleton className="h-12 w-full rounded-xl" />
				) : hasBooking ? (
					<Button
						variant="secondary"
						className="w-full py-4 text-base sm:py-5 sm:text-lg"
						onClick={handleViewBooking}
					>
						<Ticket className="h-4 w-4" />
						{translate('event.viewMyBooking')}
					</Button>
				) : (
					<Button
						variant="primary"
						className="w-full py-4 text-base sm:py-5 sm:text-lg"
						onClick={handleBookClick}
						disabled={isSoldOut}
					>
						<BookOpen className="h-4 w-4" />
						{isSoldOut ? translate('event.noSpotsLeft') : translate('event.bookTour')}
					</Button>
				)}

				{/* Trust badges */}
				<div className="mt-4 flex items-center justify-center gap-3 text-[13px] text-gray-400 sm:mt-6 sm:gap-4 sm:text-xs dark:text-gray-500">
					<div className="flex items-center gap-1">
						<CheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
						<span>{translate('event.secureBooking')}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
