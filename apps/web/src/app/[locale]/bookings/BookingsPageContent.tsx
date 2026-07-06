'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useGetMyBookings } from '../../../features/bookings/hooks/useBookings';
import BookingCard from '../../../features/bookings/components/BookingCard';
import BookingsSkeleton from './BookingsSkeleton';
import Button from '@/components/ui/Buttons/Button';
import { CalendarX, Filter } from 'lucide-react';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { useTranslation } from '@/hooks/translation';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';

export default function BookingsPageContent() {
	const translate = useTranslation();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { locale } = useTranslation();
	const navigation = useLocalizedNavigation();
	const { data: bookings, isLoading } = useGetMyBookings();
	const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'CANCELLED'>('CONFIRMED');

	useEffect(() => {
		const paymentStatus = searchParams.get('payment');
		const redirectStatus = searchParams.get('redirect_status');

		if (paymentStatus === 'success' || redirectStatus === 'succeeded') {
			addToast(translate('booking.paymentSuccess'), ToastType.SUCCESS);
			void queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
			void queryClient.invalidateQueries({ queryKey: ['events'] });
			navigation.push('/bookings');
		}
	}, [searchParams, addToast, queryClient, locale, navigation, translate]);

	if (isLoading) {
		return <BookingsSkeleton />;
	}

	const filteredBookings = useMemo(() => {
		if (!bookings?.length) return [];
		if (statusFilter === 'ALL') return bookings;
		return bookings.filter((booking) => booking.status === statusFilter);
	}, [bookings, statusFilter]);

	if (!bookings || bookings.length === 0) {
		return (
			<div className="flex min-h-full flex-col items-center justify-center px-4">
				<div className="bg-primary/10 dark:bg-primary/20 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
					<CalendarX className="text-primary h-12 w-12" strokeWidth={1.5} />
				</div>
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white">{translate('booking.noBookings')}</h2>
				<p className="mt-2 text-gray-500 dark:text-gray-400">
					{translate('booking.noBookingsDescription')}
				</p>
				<Button variant="primary" className="mt-6" onClick={() => navigation.push('/')}>
					{translate('booking.browseEvents')}
				</Button>
			</div>
		);
	}

	return (
		<div className="min-h-full max-w-full px-4 py-8">
			<div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">{translate('booking.myBookings')}</h1>
				<div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
					<Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'CONFIRMED' | 'CANCELLED')}
						className="bg-transparent text-sm font-medium text-gray-700 outline-none dark:text-gray-200"
					>
						<option value="ALL">{translate('booking.filterAll')}</option>
						<option value="CONFIRMED">{translate('booking.filterConfirmed')}</option>
						<option value="CANCELLED">{translate('booking.filterCancelled')}</option>
					</select>
				</div>
			</div>

			{filteredBookings.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-400">
					{translate('booking.noBookingsMatchFilter')}
				</div>
			) : (
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{filteredBookings.map((booking) => (
						<BookingCard key={booking.id} booking={booking} />
					))}
				</div>
			)}
		</div>
	);
}
