import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/server.api';
import { BookingWithDetails, PaginatedResponse } from '@event-space/shared';
import BookingsTable from '../_components/BookingsTable';

interface BookingPageProps {
	params: { locale: string; id: string };
}

export default async function BookingPage({ params }: BookingPageProps) {
	const { id } = params;

	try {
		const booking = await serverFetch<BookingWithDetails>(`/admin/bookings/${id}`);
		const initialBookings: PaginatedResponse<BookingWithDetails> = {
			data: [booking],
			total: 1,
			skip: 0,
			take: 1,
			hasMore: false,
			nextSkip: null,
		};

		return (
			<div className="space-y-6">
				<BookingsTable initialBookings={initialBookings} disableFetch />
			</div>
		);
	} catch (error) {
		console.error(error);
		notFound();
	}
}
