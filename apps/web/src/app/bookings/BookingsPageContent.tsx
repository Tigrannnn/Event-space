'use client';

import { useGetMyBookings } from '../../features/bookings/hooks/useBookings';
import BookingCard from '../../features/bookings/components/BookingCard';
import BookingsSkeleton from './BookingsSkeleton';
import Button from '@/components/ui/Buttons/Button';
import Link from 'next/link';
import { CalendarX } from 'lucide-react';

export default function BookingsPageContent() {
	const { data: bookings, isLoading } = useGetMyBookings();

	if (isLoading) {
		return <BookingsSkeleton />;
	}

	if (!bookings || bookings.length === 0) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
				<div className="bg-primary/10 dark:bg-primary/20 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
					<CalendarX className="text-primary h-12 w-12" strokeWidth={1.5} />
				</div>
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white">No bookings yet</h2>
				<p className="mt-2 text-gray-500 dark:text-gray-400">
					Start exploring events and book your next adventure!
				</p>
				<Link href="/">
					<Button variant="primary" className="mt-6">
						Browse Events
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="max-w-full px-4 py-8">
			<h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{bookings.map((booking) => (
					<BookingCard key={booking.id} booking={booking} />
				))}
			</div>
		</div>
	);
}
