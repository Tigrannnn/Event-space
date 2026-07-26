'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import Button from '@/components/ui/Buttons/Button';
import { useTranslation } from '@/hooks/translation';
import { formatDateTime } from '@/utils/date';
import { formatBookingReference } from '@/utils/booking';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { Calendar, MapPin, Users, CheckCircle2, XCircle, AlertCircle, Search, CreditCard } from 'lucide-react';
import { getEventTranslation } from '@event-space/shared';
import { localeIntl } from '@/lib/i18n/config';
import { useConfirm } from '@/hooks/confirmModal';

export default function CheckInForm() {
	const translate = useTranslation();
	const locale = translate.locale;
	const [input, setInput] = useState('');
	const [ref, setRef] = useState<number | null>(null);
	const { addToast } = useToastStore();
	const queryClient = useQueryClient();

	const {
		data: booking,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['checkin-booking', ref],
		queryFn: () => adminApi.getBookingByReference(ref!),
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

	const confirm = useConfirm();

	const handleCheckIn = async () => {
		const confirmed = await confirm({
			variant: 'primary',
			title: translate('admin.confirmCheckIn'),
			message: translate('admin.confirmCheckInMessage'),
		});

		if (confirmed && booking) {
			checkIn(booking.id);
		}
	};

	const handleSearch = () => {
		const num = parseInt(input.replace('#', '').trim(), 10);
		if (isNaN(num)) {
			addToast(translate('admin.invalidReference'), ToastType.ERROR);
			return;
		}
		setRef(num);
	};

	const isCheckedIn = !!booking?.checkedInAt;
	const isCancelled = booking?.status === 'CANCELLED';
	const eventTranslation = booking?.occurrence?.event ? getEventTranslation(booking.occurrence.event, locale) : null;
	const paymentMethodLabel = (() => {
		switch (booking?.paymentMethod) {
			case 'SITE_PAYMENT':
				return translate('admin.payment.site');
			case 'OFFLINE_PAID':
				return translate('admin.payment.offline');
			case 'PAY_ON_ARRIVAL':
				return translate('admin.payment.onArrival');
			default:
				return booking?.paymentMethod;
		}
	})();

	return (
		<div className="mx-auto max-w-xl space-y-6">
			<div className="group relative flex items-center rounded-xl border border-gray-300 bg-white shadow-sm transition-all focus-within:border-gray-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus-within:border-zinc-500">
				<div className="pointer-events-none absolute left-4 text-gray-400 dark:text-zinc-500">
					<Search className="h-4 w-4" />
				</div>
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
					placeholder={translate('admin.enterBookingRef')}
					className="h-12 flex-1 bg-transparent pr-4 pl-11 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-zinc-500"
				/>
				<div className="pr-1.5">
					<Button
						onClick={handleSearch}
						isLoading={isLoading}
						className="h-9 rounded-none px-4 text-xs font-semibold tracking-wide"
					>
						{translate('header.search')}
					</Button>
				</div>
			</div>

			{isError && (
				<div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
					<AlertCircle className="h-5 w-5 shrink-0" />
					<span className="font-medium">{translate('admin.bookingNotFound')}</span>
				</div>
			)}

			{booking && (
				<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-zinc-800 dark:bg-zinc-900">
					<div
						className={`flex items-center justify-between border-b px-5 py-4 dark:border-zinc-800 ${
							isCancelled
								? 'bg-red-50/50 dark:bg-red-950/10'
								: isCheckedIn
									? 'bg-amber-50/50 dark:bg-amber-950/10'
									: 'bg-emerald-50/50 dark:bg-emerald-950/10'
						}`}
					>
						<div className="flex flex-col gap-0.5">
							<span className="text-xs font-semibold tracking-wider text-gray-400 uppercase dark:text-zinc-500">
								{translate('booking.bookingRef')}
							</span>
							<span className="font-mono text-xl font-bold tracking-tight text-gray-900 dark:text-white">
								{formatBookingReference(booking.referenceNumber)}
							</span>
						</div>

						{isCancelled ? (
							<span className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
								<XCircle className="h-3.5 w-3.5" /> {translate('admin.cancelled')}
							</span>
						) : isCheckedIn ? (
							<span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
								<AlertCircle className="h-3.5 w-3.5" /> {translate('admin.alreadyCheckedIn')}
							</span>
						) : (
							<span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
								<CheckCircle2 className="h-3.5 w-3.5" /> {translate('admin.active')}
							</span>
						)}
					</div>

					<div className="space-y-6 p-5">
						<div className="space-y-1">
							<span className="text-xs font-semibold tracking-wider text-gray-400 uppercase dark:text-zinc-500">
								{translate('admin.customer')}
							</span>
							<h3 className="text-lg leading-tight font-bold text-gray-900 dark:text-white">
								{booking.user?.name || translate('booking.unknownCustomer')}
							</h3>
							<p className="text-sm text-gray-500 dark:text-zinc-400">
								{booking.user?.email || translate('booking.unknownCustomer')}
							</p>
						</div>

						<div className="space-y-3 rounded-xl bg-gray-50 p-4 dark:bg-zinc-800/50">
							<p className="text-sm font-bold text-gray-900 dark:text-white">
								{eventTranslation?.title || translate('booking.unknownEvent')}
							</p>

							<div className="grid grid-cols-1 gap-2.5 text-xs font-medium text-gray-600 sm:grid-cols-2 dark:text-zinc-400">
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4 text-gray-400 dark:text-zinc-500" />
									<span>{booking.occurrence?.date ? formatDateTime(booking.occurrence.date, localeIntl[locale]) : '—'}</span>
								</div>
								<div className="flex items-center gap-2">
									<MapPin className="h-4 w-4 text-gray-400 dark:text-zinc-500" />
									<span className="truncate">{eventTranslation?.location || translate('admin.noLocation')}</span>
								</div>
								<div className="flex items-center gap-2 border-t border-gray-200 pt-2 sm:col-span-2 dark:border-zinc-700">
									<Users className="h-4 w-4 text-gray-400 dark:text-zinc-500" />
									<span className="font-bold text-gray-900 dark:text-white">
										{booking.quantity} {translate('admin.numberOfSpots')}
									</span>
								</div>
								<div className="flex items-center gap-2 border-t border-gray-200 pt-2 sm:col-span-2 dark:border-zinc-700">
									<CreditCard className="h-4 w-4 text-gray-400 dark:text-zinc-500" />
									<span className="font-bold text-gray-900 dark:text-white">
										{paymentMethodLabel}
									</span>
								</div>
							</div>
						</div>

						{isCancelled && (
							<div className="rounded-lg bg-red-50 p-3 text-center text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400">
								{translate('admin.bookingCancelled')}
							</div>
						)}

						{isCheckedIn && (
							<div className="rounded-lg bg-amber-50 p-3 text-center text-xs font-semibold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
								{translate('admin.alreadyCheckedIn')} {formatDateTime(booking.checkedInAt!, localeIntl[locale])}
							</div>
						)}

						{!isCancelled && !isCheckedIn && (
							<Button
								variant="primary"
								className="h-11 w-full text-sm font-bold"
								onClick={handleCheckIn}
								isLoading={isCheckingIn}
							>
								{translate('admin.confirmCheckIn')}
							</Button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
