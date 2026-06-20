'use client';

import { useState, type FormEvent } from 'react';
import { CalendarDays, Search, X, Eye } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Buttons/Button';
import Select from '@/components/ui/Select';
import TablePagination from '@/components/ui/TablePagination';
import { useTranslation } from '@/hooks/translation';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/Table';
import { useAdminBookings, useUpdateBookingStatus } from '@/features/admin/hooks/useAdmin';
import { useModalStore } from '@/stores/modalStore';
import type {
	BookingStatus,
	BookingWithDetails,
	PaginatedResponse,
	TimeFilterType,
} from '@event-space/shared';
import { BookingStatusEnum, TimeFilterSchema } from '@event-space/shared';
import { ModalType } from '@/stores';
import { formatDateTime } from '@/utils/date';
import { formatBookingReference } from '@/utils/booking';

const pageSizeOptions = [10, 20, 50, 100].map((pageSize) => ({
	value: String(pageSize),
	label: `${pageSize} / page`,
}));

interface BookingsTableProps {
	initialBookings: PaginatedResponse<BookingWithDetails>;
}

function formatCurrency(price: number | string, quantity: number) {
	return new Intl.NumberFormat('en', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(Number(price) * quantity);
}

export default function BookingsTable({ initialBookings }: BookingsTableProps) {
	const translate = useTranslation();
	const [skip, setSkip] = useState(initialBookings.skip);
	const [limit, setLimit] = useState(initialBookings.take);
	const searchParams = useSearchParams();
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<BookingStatus | undefined>();
	const [time, setTime] = useState<TimeFilterType | undefined>();
	const [eventId, setEventId] = useState(searchParams.get('eventId') ?? undefined);
	const { data, isFetching } = useAdminBookings({
		skip,
		limit,
		search: search || undefined,
		status,
		time,
		eventId,
	});
	const updateBookingStatus = useUpdateBookingStatus();
	const bookingsResponse = data?.data ?? initialBookings;
	const pageStart = bookingsResponse.total === 0 ? 0 : bookingsResponse.skip + 1;
	const pageEnd = Math.min(
		bookingsResponse.skip + bookingsResponse.data.length,
		bookingsResponse.total,
	);
	const canGoPrevious = bookingsResponse.skip > 0;
	const canGoNext = bookingsResponse.hasMore && bookingsResponse.nextSkip !== null;
	const hasActiveFilters = Boolean(
		search || status !== undefined || time !== undefined || eventId !== undefined,
	);

	const { openModal } = useModalStore();
	const bookingStatusOptions = BookingStatusEnum.options.map((bookingStatus) => ({
		value: bookingStatus,
		label:
			bookingStatus === 'CONFIRMED'
				? translate('admin.confirmed')
				: bookingStatus === 'CANCELLED'
					? translate('admin.cancelled')
					: translate('admin.pending'),
	}));

	const resetPagination = () => {
		setSkip(0);
	};

	const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSearch(searchInput.trim());
		resetPagination();
	};

	const handleStatusFilterChange = (value: string) => {
		setStatus(value ? (value as BookingStatus) : undefined);
		resetPagination();
	};

	const handleTimeFilterChange = (value: string) => {
		setTime(value ? (value as TimeFilterType) : undefined);
		resetPagination();
	};

	const handlePageSizeChange = (value: string) => {
		setLimit(Number(value));
		resetPagination();
	};

	const handleResetFilters = () => {
		setSearchInput('');
		setSearch('');
		setStatus(undefined);
		setTime(undefined);
		setEventId(undefined);
		resetPagination();
	};

	const handleBookingStatusChange = (bookingId: string, nextStatus: BookingStatus) => {
		updateBookingStatus.mutate({ id: bookingId, status: nextStatus });
	};

	const handleOpenBookingDetails = (booking: BookingWithDetails) => {
		openModal(ModalType.BookingDetails, { booking });
	};

	const handlePreviousPage = () => {
		setSkip((currentSkip: number) => Math.max(currentSkip - limit, 0));
	};

	const handleNextPage = () => {
		if (bookingsResponse.nextSkip !== null) {
			setSkip(bookingsResponse.nextSkip);
		}
	};

	return (
		<div className="overflow-hidden rounded-lg border border-gray-500 shadow-sm">
			<div className="flex flex-col gap-4 px-3 py-3 sm:px-5 sm:py-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="font-semibold text-gray-900 dark:text-gray-100">
							{translate('admin.allBookings')}
						</p>
						<p className="text-sm text-gray-500">
							{translate('admin.showing')} {pageStart}-{pageEnd} {translate('admin.of')}{' '}
							{bookingsResponse.total} {translate('admin.bookings')}
						</p>
					</div>

					<Button
						type="button"
						size="sm"
						variant="primary"
						onClick={() => openModal(ModalType.CreateManualBooking)}
					>
						{translate('admin.createManualBooking')}
					</Button>
				</div>

				<div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
					<form onSubmit={handleSearchSubmit} className="flex min-w-0 flex-1 gap-2">
						<div className="relative min-w-0 flex-1">
							<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
							<input
								value={searchInput}
								onChange={(event) => setSearchInput(event.target.value)}
								placeholder={translate('admin.searchPlaceholder')}
								className="focus:border-primary h-10 w-full rounded-md border border-gray-500 bg-transparent pr-3 pl-9 text-sm transition outline-none placeholder:text-gray-400"
							/>
						</div>
						<Button type="submit" size="sm" variant="secondary" disabled={isFetching}>
							{translate('header.search')}
						</Button>
					</form>

					<div className="flex flex-wrap items-center gap-2">
						<Select
							value={status ?? ''}
							onValueChange={handleStatusFilterChange}
							options={[
								{ value: '', label: translate('admin.allStatuses') },
								...BookingStatusEnum.options.map((s) => ({
									value: s,
									label:
										s === 'CONFIRMED'
											? translate('admin.confirmed')
											: s === 'CANCELLED'
												? translate('admin.cancelled')
												: translate('admin.pending'),
								})),
							]}
						/>

						<Select
							value={time ?? ''}
							onValueChange={handleTimeFilterChange}
							options={[
								{ value: '', label: translate('admin.anyTime') },
								...TimeFilterSchema.options.map((t) => ({
									value: t,
									label: t === 'upcoming' ? translate('admin.upcoming') : translate('admin.completed'),
								})),
							]}
						/>

						<Select
							value={limit}
							onValueChange={handlePageSizeChange}
							options={[
								...pageSizeOptions.map((ps) => ({
									...ps,
									label: `${ps.value} ${translate('admin.pageSize')}`,
								})),
							]}
						/>

						{hasActiveFilters && (
							<Button type="button" size="sm" variant="secondary" onClick={handleResetFilters}>
								<X className="h-4 w-4" />
								{translate('admin.reset')}
							</Button>
						)}
					</div>
				</div>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="px-3 sm:px-5">{translate('admin.customer')}</TableHead>
						<TableHead>{translate('admin.event')}</TableHead>
						<TableHead>{translate('admin.status')}</TableHead>
						<TableHead>{translate('admin.qty')}</TableHead>
						<TableHead>{translate('admin.total')}</TableHead>
						<TableHead>{translate('admin.reference')}</TableHead>
						<TableHead>{translate('admin.booked')}</TableHead>
						<TableHead>{translate('admin.actions')}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{bookingsResponse.data.length === 0 && (
						<TableRow>
							<TableCell colSpan={7} className="px-3 py-8 text-center text-gray-500 sm:px-5">
								{translate('admin.noBookingsFound')}
							</TableCell>
						</TableRow>
					)}

					{bookingsResponse.data.map((booking: BookingWithDetails) => (
						<TableRow key={booking.id}>
							<TableCell className="px-3 sm:px-5">
								<div className="min-w-0">
									<p className="font-medium text-gray-900 dark:text-gray-100">
										{booking.user?.name || translate('booking.unknownCustomer')}
									</p>
									<p className="text-sm text-gray-500 dark:text-gray-400">{booking.user?.email || '—'}</p>
								</div>
							</TableCell>
							<TableCell>
								<div className="max-w-md min-w-0">
									<p className="truncate font-medium text-gray-900 dark:text-gray-100">
										{booking.event?.title || translate('booking.unknownEvent')}
									</p>
									<p className="truncate text-sm text-gray-500 dark:text-gray-400">
										{booking.event?.location || '—'}
									</p>
								</div>
							</TableCell>
							<TableCell>
								<div className="flex items-center gap-2">
									<Select
										value={booking.status}
										onValueChange={(value) => handleBookingStatusChange(booking.id, value as BookingStatus)}
										disabled={updateBookingStatus.isPending}
										size="sm"
										aria-label={`${translate('admin.updateEvent')} ${booking.user?.name || translate('booking.unknownCustomer')}`}
										options={bookingStatusOptions}
									/>
								</div>
							</TableCell>
							<TableCell>{booking.quantity}</TableCell>
							<TableCell>
								{booking.event ? formatCurrency(booking.event.price, booking.quantity) : '—'}
							</TableCell>
							<TableCell>
								<p>{formatBookingReference(booking.referenceNumber)}</p>
							</TableCell>
							<TableCell>
								<div className="flex items-center gap-2 text-sm">
									<CalendarDays className="h-4 w-4 text-gray-400" />
									{formatDateTime(booking.createdAt)}
								</div>
							</TableCell>
							<TableCell>
								<Button
									type="button"
									size="sm"
									variant="secondary"
									onClick={() => handleOpenBookingDetails(booking)}
								>
									<Eye className="mr-2 h-4 w-4" />
									{translate('admin.details')}
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<TablePagination
				skip={bookingsResponse.skip}
				limit={limit}
				isLoading={isFetching}
				canGoPrevious={canGoPrevious}
				canGoNext={canGoNext}
				onPreviousPage={handlePreviousPage}
				onNextPage={handleNextPage}
			/>
		</div>
	);
}
