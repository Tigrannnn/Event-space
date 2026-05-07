import { serverFetch } from '@/lib/server.api';
import type { BookingWithDetails, PaginatedResponse } from '@event-space/shared';
import BookingsTable from './_components/BookingsTable';

export default async function BookingsPage() {
	const bookings = await serverFetch<PaginatedResponse<BookingWithDetails>>('/admin/bookings');

	return (
		<div className="space-y-6">
			<BookingsTable initialBookings={bookings} />
		</div>
	);
}
