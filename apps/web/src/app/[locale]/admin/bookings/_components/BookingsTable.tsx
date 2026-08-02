'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Eye, Ban, Plus, Pencil } from 'lucide-react';
import Button from '@/components/ui/Buttons/Button';
import Select from '@/components/ui/Select';
import TablePagination from '@/components/ui/TablePagination';
import { useTranslation } from '@/hooks/translation';
import { useUrlFilters } from '@/hooks/urlFilters';
import AdminFilterBar from '../../_components/AdminFilterBar';
import { DateRangePicker, formatDateParam, parseDateParam } from '@/components/filters';
import {
	countActiveBookingsFilters,
	emptyBookingsFilters,
	parseBookingsFilters,
	serializeBookingsFilters,
	type AdminBookingsFilters,
} from './bookings-filters';
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
import {
	BookingStatusEnum,
	PaymentMethodEnum,
	TimeFilterSchema,
	getEventTranslation,
	type PaymentMethod,
} from '@event-space/shared';
import { startOfToday, subDays } from 'date-fns';
import { useLabels } from '@/hooks/labels/useLabels';
import type { DateRangePreset } from '@/components/filters';
import { ModalType } from '@/stores';
import { formatBookingReference } from '@/utils/booking';
import { useFormatDate, useFormatCurrency } from '@/hooks/format';
import Badge from '@/components/ui/Badge';

const pageSizeOptions = [10, 20, 50, 100].map((pageSize) => ({
	value: String(pageSize),
	label: `${pageSize} / page`,
}));

interface BookingsTableProps {
	initialBookings: PaginatedResponse<BookingWithDetails>;
}

export default function BookingsTable({ initialBookings }: BookingsTableProps) {
	const translate = useTranslation();
	const locale = translate.locale;
	const { formatDateTime } = useFormatDate();
	const formatCurrency = useFormatCurrency();
	const { filters, setFilters, resetFilters, activeCount } = useUrlFilters({
		parse: parseBookingsFilters,
		serialize: serializeBookingsFilters,
		empty: emptyBookingsFilters,
		countActive: countActiveBookingsFilters,
	});
	const { skip, limit, status, time, eventId, createdFrom, createdTo, paymentMethod } = filters;

	const [searchInput, setSearchInput] = useState(filters.search ?? '');
	useEffect(() => {
		setSearchInput(filters.search ?? '');
	}, [filters.search]);

	const { data, isFetching } = useAdminBookings(filters);
	const bookingsResponse = data ?? initialBookings;
	const pageStart = bookingsResponse.total === 0 ? 0 : bookingsResponse.skip + 1;
	const pageEnd = Math.min(
		bookingsResponse.skip + bookingsResponse.data.length,
		bookingsResponse.total,
	);
	const canGoPrevious = bookingsResponse.skip > 0;
	const canGoNext = bookingsResponse.hasMore && bookingsResponse.nextSkip !== null;
	const hasActiveFilters = activeCount > 0;

	const { openModal } = useModalStore();
	const { BOOKING_STATUS_LABELS, PAYMENT_METHOD_LABELS } = useLabels();

	/** Looking back over a recent window is the common case, so it gets one click. */
	const createdPresets: DateRangePreset[] = [7, 30, 90].map((days) => ({
		key: `last-${days}`,
		label: translate('admin.lastDays', { days }),
		getRange: () => ({ from: subDays(startOfToday(), days - 1), to: startOfToday() }),
	}));

	const applyFilter = (patch: Partial<AdminBookingsFilters>) => {
		setFilters({ ...filters, ...patch, skip: 0 });
	};

	const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		applyFilter({ search: searchInput.trim() || undefined });
	};

	const handleResetFilters = () => {
		setSearchInput('');
		resetFilters();
	};

	const handleOpenBookingDetails = (booking: BookingWithDetails) => {
		openModal(ModalType.BookingDetails, { booking });
	};

	const handleOpenBookingAction = (booking: BookingWithDetails) => {
		openModal(ModalType.BookingCancel, { booking });
	};

	const handlePreviousPage = () => {
		setFilters({ ...filters, skip: Math.max(skip - limit, 0) });
	};

	const handleNextPage = () => {
		if (bookingsResponse.nextSkip !== null) {
			setFilters({ ...filters, skip: bookingsResponse.nextSkip });
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
						<Plus className="h-4 w-4" />
						{translate('admin.createManualBooking')}
					</Button>
				</div>

				<AdminFilterBar
					searchValue={searchInput}
					onSearchValueChange={setSearchInput}
					onSearchSubmit={handleSearchSubmit}
					searchPlaceholder={translate('admin.searchPlaceholder')}
					isFetching={isFetching}
					activeCount={activeCount}
					showReset={hasActiveFilters}
					onReset={handleResetFilters}
				>
					<Select
						variant="filter"
						size="sm"
						isActive={status !== undefined}
						value={status ?? ''}
							onValueChange={(value) =>
								applyFilter({ status: (value as BookingStatus) || undefined })
							}
							options={[
								{ value: '', label: translate('admin.allStatuses') },
								...BookingStatusEnum.options.map((s) => ({
									value: s,
									label: BOOKING_STATUS_LABELS[s],
								})),
							]}
						/>

					<Select
						variant="filter"
						size="sm"
						isActive={time !== undefined}
						value={time ?? ''}
							onValueChange={(value) => applyFilter({ time: (value as TimeFilterType) || undefined })}
							options={[
								{ value: '', label: translate('admin.anyTime') },
								...TimeFilterSchema.options.map((t) => ({
									value: t,
									label: t === 'upcoming' ? translate('admin.upcoming') : translate('admin.completed'),
								})),
							]}
						/>

					<Select
						variant="filter"
						size="sm"
						isActive={paymentMethod !== undefined}
						value={paymentMethod ?? ''}
							onValueChange={(value) =>
								applyFilter({ paymentMethod: (value as PaymentMethod) || undefined })
							}
							options={[
								{ value: '', label: translate('admin.anyPaymentMethod') },
								...PaymentMethodEnum.options.map((method) => ({
									value: method,
									label: PAYMENT_METHOD_LABELS[method],
								})),
							]}
						/>

						<DateRangePicker
							value={
								createdFrom || createdTo
									? {
											from: parseDateParam(createdFrom ?? createdTo ?? null) ?? new Date(),
											to: parseDateParam(createdTo ?? createdFrom ?? null) ?? new Date(),
										}
									: null
							}
							onChange={(range) =>
								applyFilter({
									createdFrom: range ? formatDateParam(range.from) : undefined,
									createdTo: range ? formatDateParam(range.to) : undefined,
								})
							}
							placeholder={translate('admin.bookedPeriod')}
							// Bookings can only have been created in the past.
							disabled={{ after: new Date() }}
							presets={createdPresets}
						/>

					<Select
						variant="filter"
						size="sm"
						value={limit}
							onValueChange={(value) => applyFilter({ limit: Number(value) })}
							options={[
								...pageSizeOptions.map((ps) => ({
									...ps,
									label: `${ps.value} ${translate('admin.pageSize')}`,
								})),
							]}
						/>

				</AdminFilterBar>
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
						<TableHead>{translate('admin.checkedAt')}</TableHead>
						<TableHead>{translate('admin.actions')}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{bookingsResponse.data.length === 0 && (
						<TableRow>
							<TableCell colSpan={8} className="px-3 py-8 text-center text-gray-500 sm:px-5">
								{translate('admin.noBookingsFound')}
							</TableCell>
						</TableRow>
					)}

					{bookingsResponse.data.map((booking: BookingWithDetails) => {
						const eventTranslation = booking.occurrence?.event
							? getEventTranslation(booking.occurrence?.event, locale)
							: null;
						return (
							<TableRow key={booking.id}>
								<TableCell className="px-3 sm:px-5">
									<div className="min-w-0">
										<p className="font-medium text-gray-900 dark:text-gray-100">
											{booking.user?.name || translate('booking.unknownCustomer')}
										</p>
										<p className="text-sm text-gray-500 dark:text-gray-400">{booking.user?.email || '—'}</p>
										{booking.user?.phone && (
											<p className="text-sm text-gray-500 dark:text-gray-400">{booking.user.phone}</p>
										)}
									</div>
								</TableCell>
								<TableCell>
									<div className="max-w-md min-w-0">
										<p className="truncate font-medium text-gray-900 dark:text-gray-100">
											{eventTranslation?.title || translate('booking.unknownEvent')}
										</p>
										<p className="truncate text-sm text-gray-500 dark:text-gray-400">
											{eventTranslation?.location || '—'}
										</p>
									</div>
								</TableCell>
								<TableCell>
									<Badge
										label={booking.status}
										variant={
											booking.status === 'CONFIRMED'
												? 'success'
												: booking.status === 'CANCELLED'
													? 'danger'
													: 'warning'
										}
									/>
								</TableCell>
								<TableCell>{booking.quantity}</TableCell>
								<TableCell>{formatCurrency(booking.amount)}</TableCell>
								<TableCell>
									<p>{formatBookingReference(booking.referenceNumber)}</p>
								</TableCell>
								<TableCell>
									{booking.checkedInAt ? formatDateTime(booking.checkedInAt) : '—'}
								</TableCell>
								<TableCell>
									<div className="flex flex-wrap gap-2">
										<Button
											type="button"
											size="sm"
											variant="secondary"
											onClick={() => handleOpenBookingDetails(booking)}
										>
											<Eye className="h-4 w-4" />
										</Button>

										<Button
											type="button"
											size="sm"
											variant="secondary"
											onClick={() => openModal(ModalType.UpdateBooking, { booking })}
											disabled={booking.status === 'CANCELLED'}
										>
											<Pencil className="h-4 w-4" />
										</Button>

										<Button
											type="button"
											size="sm"
											variant="danger"
											onClick={() => handleOpenBookingAction(booking)}
											disabled={booking.status === 'CANCELLED'}
										>
											<Ban className="h-4 w-4" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						);
					})}
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
