'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useGetMyBookings } from '../../features/bookings/hooks/useBookings';
import BookingCard from '../../features/bookings/components/BookingCard';
import BookingsSkeleton from './BookingsSkeleton';
import Button from '@/components/ui/Buttons/Button';
import { CalendarX } from 'lucide-react';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { useI18nStore } from '@/stores/i18n';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';

export default function BookingsPageContent() {
	const { translate } = useI18nStore();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { locale } = useI18nStore();
	const navigation = useLocalizedNavigation();
	const { data: bookings, isLoading } = useGetMyBookings();

	useEffect(() => {
		const paymentStatus = searchParams.get('payment');
		const redirectStatus = searchParams.get('redirect_status');

		if (paymentStatus === 'success' || redirectStatus === 'succeeded') {
			addToast('Payment successful! Your booking will be confirmed shortly.', ToastType.SUCCESS);
			void queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
			void queryClient.invalidateQueries({ queryKey: ['events'] });
			navigation.push('/bookings');
		}
	}, [searchParams, addToast, queryClient, locale]);

	if (isLoading) {
		return <BookingsSkeleton />;
	}

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
			<h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">{translate('booking.myBookings')}</h1>
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{bookings.map((booking) => (
					<BookingCard key={booking.id} booking={booking} />
				))}
			</div>
		</div>
	);
}
