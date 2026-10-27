'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Calendar, MapPin, Navigation, Plus, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Button from '@/components/ui/Buttons/Button';
import { CheckIcon } from '../../../../components/ui/Icons';
import {
	Event,
	isEventAvailable,
	getEventTranslation,
	getUpcomingEventOccurrences,
	quoteBooking,
} from '@event-space/shared';
import { useCurrentUser } from '@/features/users';
import { useHasBookingForOccurrence } from '@/features/bookings/hooks/useBookings';
import { Skeleton } from '@/components/ui/Skeleton';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { useTranslation } from '@/hooks/translation';
import { ModalType, useModalStore } from '@/stores';
import React from 'react';
import { useFormatCurrency } from '@/hooks/format';
import { TimeZoneNote } from '@/components/shared/TimeZoneNote';
import { FlashValue } from '@/components/ui/FlashValue';
import { OccurrencePicker } from '../OccurrencePicker';
import { useSkin } from '@/providers/BrandProvider';

export interface BookingSidebarProps {
	event: Event;
}

export default function BookingSidebar({ event }: BookingSidebarProps) {
	const formatCurrency = useFormatCurrency();
	const navigation = useLocalizedNavigation();
	const translate = useTranslation();
	const skin = useSkin();
	const isMinimal = skin === 'minimal';
	const isListing = skin === 'listing';
	const cardClassName = isMinimal
		? 'rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-neutral-800 dark:bg-neutral-900'
		: 'rounded-2xl border border-gray-100 bg-white p-5 shadow-xl sm:rounded-[2.5rem] sm:p-6 md:p-8 dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50';
	const locale = translate.locale;
	const eventTranslation = getEventTranslation(event, locale);
	const [selectedOccId, setSelectedOccId] = useState<string | undefined>(undefined);

	const upcomingOccurrences = useMemo(() => getUpcomingEventOccurrences(event), [event]);
	const selectedOccurrence = useMemo(
		() =>
			upcomingOccurrences.find((occurrence) => occurrence.id === selectedOccId) ??
			upcomingOccurrences[0],
		[upcomingOccurrences, selectedOccId],
	);

	const { openModal } = useModalStore();

	const quote = quoteBooking(
		{ price: event.price, discountPercent: selectedOccurrence?.discountPercent },
		{ quantity: 1 },
	);

	const currentParticipants = Number(selectedOccurrence?.currentParticipants ?? 0);
	const maxParticipants = Number(selectedOccurrence?.maxParticipants ?? 0);
	const progressPercentage =
		maxParticipants > 0 ? Math.min(100, (currentParticipants / maxParticipants) * 100) : 0;
	const spotsLeft = Math.max(0, maxParticipants - currentParticipants);
	const isSoldOut = maxParticipants > 0 && currentParticipants >= maxParticipants;

	const { data: user, isLoading: isUserLoading } = useCurrentUser();
	const { hasBooking: isOccurrenceBooked, isLoading: isMyBookingsLoading } =
		useHasBookingForOccurrence();

	const hasBooking = isOccurrenceBooked(selectedOccurrence?.id);

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

	const canBook = !hasBooking && !isSoldOut;

	const handleBookClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		if (user) {
			openModal(ModalType.CreateBooking, {
				event,
				selectedOccurrence: canBook ? selectedOccurrence : undefined,
			});
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
			<div>
				<div className={cardClassName}>
					<div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800/70">
						<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
							{translate('event.noUpcomingOccurrences')}
						</p>
					</div>
				</div>
			</div>
		);
	}

	const placeRow = (icon: React.ReactNode, label: string, text: string, url?: string | null) => (
		<div className="flex items-start gap-3 text-sm">
			<span className="mt-0.5 text-gray-500 dark:text-gray-400">{icon}</span>
			<div className="min-w-0">
				<p className="text-gray-500 dark:text-gray-400">{label}</p>
				{url ? (
					<a
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						className="font-medium text-gray-900 underline underline-offset-4 dark:text-white"
					>
						{text}
					</a>
				) : (
					<p className="font-medium text-gray-900 dark:text-white">{text}</p>
				)}
			</div>
		</div>
	);

	if (isListing) {
		const hasFreeCancellation = (event.cancellationRules ?? []).some(
			(rule) => rule.refundPercentage === 100 && rule.hoursBeforeEvent > 0,
		);
		const facts = [
			hasFreeCancellation && translate('event.freeCancellation'),
			translate('event.secureBooking'),
		].filter((fact): fact is string => typeof fact === 'string');

		return (
			<div className="overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-neutral-700 dark:bg-neutral-900">
				<div className="bg-primary/8 border-b border-gray-200 px-5 py-4 dark:border-neutral-800">
					<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
						{quote.discountPercent > 0 && (
							<span className="rounded bg-(--brand-accent) px-2 py-0.5 text-xs font-bold text-white">
								{translate('event.discountOff', { percent: quote.discountPercent })}
							</span>
						)}
						{quote.discountPercent > 0 && (
							<span className="text-sm text-gray-500 line-through">
								{formatCurrency(quote.baseUnitPrice)}
							</span>
						)}
					</div>
					<div className="mt-1 flex items-baseline gap-2">
						<span className="text-3xl font-bold text-gray-900 dark:text-white">
							{formatCurrency(quote.unitPrice)}
						</span>
						<span className="text-sm text-gray-600 dark:text-gray-400">
							{translate('event.perPerson')}
						</span>
					</div>
				</div>

				<div className="space-y-5 p-5">
					<div>
						<p className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
							{translate('event.date')}
						</p>
						<OccurrencePicker
							occurrences={upcomingOccurrences}
							selectedId={selectedOccurrence?.id}
							onSelect={setSelectedOccId}
							price={event.price}
							isBooked={isOccurrenceBooked}
						/>
						<TimeZoneNote className="mt-2" />
					</div>

					<div>
						<div className="mb-1.5 flex justify-between gap-3 text-sm">
							<span className="text-gray-600 dark:text-gray-400">
								{currentParticipants} / {maxParticipants} {translate('event.participants')}
							</span>
							<FlashValue
								watch={spotsLeft}
								className={
									spotsLeft <= 5
										? 'font-semibold text-red-600 dark:text-red-400'
										: 'font-semibold text-gray-900 dark:text-white'
								}
							>
								{spotsLeft} {translate('event.spotsLeft')}
							</FlashValue>
						</div>
						<div className="h-1.5 w-full overflow-hidden rounded-sm bg-gray-200 dark:bg-neutral-800">
							<div
								className="bg-primary h-1.5 transition-all duration-500"
								style={{ width: `${progressPercentage}%` }}
							/>
						</div>
					</div>

					<div>
						{!eventIsAvailable ? (
							<p className="rounded-md border border-gray-200 p-4 text-center text-sm font-medium text-gray-700 dark:border-neutral-700 dark:text-gray-300">
								{translate('event.eventEnded')}
							</p>
						) : isUserLoading || isMyBookingsLoading ? (
							<Skeleton className="h-12 w-full rounded-md" />
						) : hasBooking ? (
							<div className="flex flex-col gap-2">
								<Button variant="primary" className="w-full" onClick={handleBookClick}>
									<Plus className="h-4 w-4" strokeWidth={2.5} />
									{translate('event.bookAnotherSpot')}
								</Button>
								<Button variant="secondary" className="w-full" onClick={handleViewBooking}>
									<Ticket className="h-4 w-4" />
									{translate('event.viewMyBooking')}
								</Button>
							</div>
						) : (
							<Button
								variant="primary"
								className="w-full py-3"
								onClick={handleBookClick}
								disabled={isSoldOut}
							>
								{isSoldOut ? translate('event.noSpotsLeft') : translate('event.bookTour')}
							</Button>
						)}
						<ul className="mt-3 space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
							{facts.map((fact) => (
								<li key={fact} className="flex items-center gap-2">
									<CheckIcon className="size-4 shrink-0 text-emerald-600" />
									{fact}
								</li>
							))}
						</ul>
					</div>

					<div className="space-y-4 border-t border-gray-200 pt-4 dark:border-neutral-800">
						{placeRow(
							<MapPin className="size-5" />,
							translate('event.location'),
							eventTranslation.location,
							event.locationUrl,
						)}
						{placeRow(
							<Navigation className="size-5" />,
							translate('event.meetingLocationLabel'),
							eventTranslation.meetingLocation,
							event.meetingLocationUrl,
						)}
					</div>
				</div>
			</div>
		);
	}

	if (isMinimal) {
		return (
			<div className={cardClassName}>
				<div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
					<span className="text-2xl font-semibold text-gray-900 dark:text-white">
						{formatCurrency(quote.unitPrice)}
					</span>
					{quote.discountPercent > 0 && (
						<span className="text-base text-gray-400 line-through">
							{formatCurrency(quote.baseUnitPrice)}
						</span>
					)}
					<span className="text-gray-500 dark:text-gray-400">{translate('event.perPerson')}</span>
				</div>
				{quote.discountPercent > 0 && (
					<p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
						{translate('event.discountOff', { percent: quote.discountPercent })}
					</p>
				)}

				<div className="mt-5">
					<p className="mb-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
						{translate('event.date')}
					</p>
					<OccurrencePicker
						occurrences={upcomingOccurrences}
						selectedId={selectedOccurrence?.id}
						onSelect={setSelectedOccId}
						price={event.price}
						isBooked={isOccurrenceBooked}
					/>
					<TimeZoneNote className="mt-2" />
				</div>

				<div className="mt-5">
					<div className="mb-1.5 flex justify-between gap-3 text-sm">
						<span className="text-gray-500 dark:text-gray-400">
							{currentParticipants} / {maxParticipants} {translate('event.participants')}
						</span>
						<FlashValue watch={spotsLeft} className="font-medium text-gray-900 dark:text-white">
							{spotsLeft} {translate('event.spotsLeft')}
						</FlashValue>
					</div>
					<div className="h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-800">
						<div
							className="bg-primary h-1 rounded-full transition-all duration-500"
							style={{ width: `${progressPercentage}%` }}
						/>
					</div>
					{spotsLeft <= 5 && !isSoldOut && (
						<p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
							{translate('event.sellingFast')}
						</p>
					)}
				</div>

				<div className="mt-6">
					{!eventIsAvailable ? (
						<p className="rounded-xl border border-gray-200 p-4 text-center text-sm font-medium text-gray-700 dark:border-neutral-700 dark:text-gray-300">
							{translate('event.eventEnded')}
						</p>
					) : isUserLoading || isMyBookingsLoading ? (
						<Skeleton className="h-12 w-full rounded-full" />
					) : hasBooking ? (
						<div className="flex flex-col gap-2">
							<Button variant="primary" className="w-full" onClick={handleBookClick}>
								<Plus className="h-4 w-4" strokeWidth={2.5} />
								{translate('event.bookAnotherSpot')}
							</Button>
							<Button variant="secondary" className="w-full" onClick={handleViewBooking}>
								<Ticket className="h-4 w-4" />
								{translate('event.viewMyBooking')}
							</Button>
						</div>
					) : (
						<Button variant="primary" className="w-full" onClick={handleBookClick} disabled={isSoldOut}>
							{isSoldOut ? translate('event.noSpotsLeft') : translate('event.bookTour')}
						</Button>
					)}
					<p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
						<CheckIcon className="h-4 w-4" />
						{translate('event.secureBooking')}
					</p>
				</div>

				<div className="mt-6 space-y-4 border-t border-gray-200 pt-5 dark:border-neutral-800">
					{placeRow(
						<MapPin className="size-5" />,
						translate('event.location'),
						eventTranslation.location,
						event.locationUrl,
					)}
					{placeRow(
						<Navigation className="size-5" />,
						translate('event.meetingLocationLabel'),
						eventTranslation.meetingLocation,
						event.meetingLocationUrl,
					)}
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className={cardClassName}>
				{/* Price */}
				<div className="mb-5 sm:mb-6">
					<div className="flex flex-wrap items-baseline gap-2">
						<span className="text-primary text-3xl font-black in-data-[skin=minimal]:font-semibold in-data-[skin=minimal]:text-gray-900 sm:text-4xl in-data-[skin=minimal]:dark:text-white">
							{formatCurrency(quote.unitPrice)}
						</span>
						{quote.discountPercent > 0 && (
							<>
								<span className="text-lg font-semibold text-gray-400 line-through">
									{formatCurrency(quote.baseUnitPrice)}
								</span>
								<span className="rounded-full bg-red-500 px-2 py-1 text-[11px] leading-none font-black text-white">
									{translate('event.discountOff', { percent: quote.discountPercent })}
								</span>
							</>
						)}
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
						<FlashValue watch={spotsLeft} className="text-primary font-bold dark:text-emerald-400">
							{spotsLeft} {translate('event.spotsLeft')}
						</FlashValue>
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
					<div className="flex items-center gap-2.5 rounded-xl bg-gray-50 p-3 in-data-[skin=minimal]:rounded-none in-data-[skin=minimal]:border-b in-data-[skin=minimal]:border-gray-200 in-data-[skin=minimal]:bg-transparent in-data-[skin=minimal]:px-0 sm:gap-3 sm:rounded-2xl sm:p-4 in-data-[skin=minimal]:sm:rounded-none in-data-[skin=minimal]:sm:px-0 dark:bg-gray-700/50 in-data-[skin=minimal]:dark:border-neutral-800 in-data-[skin=minimal]:dark:bg-transparent">
						<Calendar className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
						<div className="flex w-full flex-col gap-2">
							<span className="text-[13px] font-medium text-gray-500 uppercase sm:text-xs dark:text-gray-400">
								{translate('event.date')}
							</span>
							<OccurrencePicker
								occurrences={upcomingOccurrences}
								selectedId={selectedOccurrence?.id}
								onSelect={setSelectedOccId}
								price={event.price}
								isBooked={isOccurrenceBooked}
							/>
							<TimeZoneNote className="mt-2" />
						</div>
					</div>
					<div className="flex items-center gap-2.5 rounded-xl bg-gray-50 p-3 in-data-[skin=minimal]:rounded-none in-data-[skin=minimal]:border-b in-data-[skin=minimal]:border-gray-200 in-data-[skin=minimal]:bg-transparent in-data-[skin=minimal]:px-0 sm:gap-3 sm:rounded-2xl sm:p-4 in-data-[skin=minimal]:sm:rounded-none in-data-[skin=minimal]:sm:px-0 dark:bg-gray-700/50 in-data-[skin=minimal]:dark:border-neutral-800 in-data-[skin=minimal]:dark:bg-transparent">
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
									{eventTranslation.location}
								</a>
							) : (
								<span className="text-sm font-medium sm:text-base">{eventTranslation.location}</span>
							)}
						</div>
					</div>

					<div className="flex items-center gap-2.5 rounded-xl bg-gray-50 p-3 in-data-[skin=minimal]:rounded-none in-data-[skin=minimal]:border-b in-data-[skin=minimal]:border-gray-200 in-data-[skin=minimal]:bg-transparent in-data-[skin=minimal]:px-0 sm:gap-3 sm:rounded-2xl sm:p-4 in-data-[skin=minimal]:sm:rounded-none in-data-[skin=minimal]:sm:px-0 dark:bg-gray-700/50 in-data-[skin=minimal]:dark:border-neutral-800 in-data-[skin=minimal]:dark:bg-transparent">
						<Navigation className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
						<div className="flex flex-col">
							<span className="text-[13px] font-medium text-gray-500 uppercase sm:text-xs dark:text-gray-400">
								{translate('event.meetingLocationLabel')}
							</span>
							{event.meetingLocationUrl ? (
								<a
									href={event.meetingLocationUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-primary text-sm font-medium underline underline-offset-2 transition-colors sm:text-base"
								>
									{eventTranslation.meetingLocation}
								</a>
							) : (
								<span className="text-sm font-medium sm:text-base">{eventTranslation.meetingLocation}</span>
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
					<Skeleton className="h-10 w-full rounded-xl" />
				) : hasBooking ? (
					<div
						className="border-primary/20 dark:border-primary/30 relative z-20 flex h-12 w-full overflow-hidden rounded-xl border shadow-sm in-data-[skin=minimal]:rounded-full"
						role="group"
					>
						<button
							type="button"
							onClick={handleViewBooking}
							className="focus-visible:ring-primary bg-primary/6 text-primary hover:bg-primary/12 dark:bg-primary/10 dark:text-primary-foreground dark:hover:bg-primary/20 flex flex-1 items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset"
						>
							<Ticket className="h-4 w-4 shrink-0" />
							<span className="truncate">{translate('event.viewMyBooking')}</span>
						</button>
						<button
							type="button"
							onClick={handleBookClick}
							aria-label={translate('event.bookAnotherSpot')}
							title={translate('event.bookAnotherSpot')}
							className="bg-primary hover:bg-primary/90 focus-visible:ring-primary border-primary/20 dark:border-primary/30 flex w-12 shrink-0 items-center justify-center border-l text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset sm:w-14"
						>
							<Plus className="h-5 w-5" strokeWidth={2.5} />
						</button>
					</div>
				) : (
					<Button variant="primary" className="w-full" onClick={handleBookClick} disabled={isSoldOut}>
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
