'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { localizePath } from '@/lib/i18n/config';
import {
	Eye,
	Ban,
	Plus,
	Pencil,
	CheckCircle,
	Undo2,
	UserCheck,
	HandCoins,
	CalendarClock,
} from 'lucide-react';
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
import {
	useAdminBookings,
	useCheckInBooking,
	useUndoBookingCheckIn,
} from '@/features/admin/hooks/useAdmin';
import { useConfirm } from '@/hooks/confirmModal';
import { useModalStore } from '@/stores/modalStore';
import type {
	BookingAuthor,
	BookingDisplayStatus,
	BookingWithDetails,
	PaginatedResponse,
	TimeFilterType,
} from '@event-space/shared';
import {
	BookingAuthorSchema,
	BookingDisplayStatusEnum,
	getBookingDisplayStatus,
	PaymentMethodEnum,
	TimeFilterSchema,
	getEventTranslation,
	type PaymentMethod,
} from '@event-space/shared';
import { addDays, startOfToday, subDays } from 'date-fns';
import { useLabels } from '@/hooks/labels/useLabels';
import type { DateRangePreset } from '@/components/filters';
import { ModalType } from '@/stores';
import { formatBookingReference, getBookingStatusBadgeVariant } from '@/utils/booking';
import { useFormatDate, useFormatCurrency } from '@/hooks/format';
import Badge from '@/components/ui/Badge';
import { TimeZoneNote } from '@/components/shared/TimeZoneNote';

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
	const { skip, limit, status, time, eventId, createdFrom, createdTo, tourFrom, tourTo, paymentMethod, createdBy } =
		filters;

	const [searchInput, setSearchInput] = useState(filters.search ?? '');
	useEffect(() => {
		setSearchInput(filters.search ?? '');
	}, [filters.search]);

	const { data, isFetching } = useAdminBookings(filters);
	const { mutate: undoCheckIn, isPending: isUndoingCheckIn } = useUndoBookingCheckIn();
	const { mutate: checkIn, isPending: isCheckingIn } = useCheckInBooking();
	const confirm = useConfirm();
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

	/** Tours are mostly looked up ahead of time: today's group, this week's, this month's. */
	const tourPresets: DateRangePreset[] = [
		{
			key: 'today',
			label: translate('admin.today'),
			getRange: () => ({ from: startOfToday(), to: startOfToday() }),
		},
		...[7, 30].map((days) => ({
			key: `next-${days}`,
			label: translate('admin.nextDays', { days }),
			getRange: () => ({ from: startOfToday(), to: addDays(startOfToday(), days - 1) }),
		})),
	];

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

	const handleCheckIn = async (bookingId: string) => {
		const confirmed = await confirm({
			variant: 'primary',
			title: translate('admin.confirmCheckIn'),
			message: translate('admin.confirmCheckInMessage'),
		});

		if (confirmed) checkIn(bookingId);
	};

	const handleUndoCheckIn = async (bookingId: string) => {
		const confirmed = await confirm({
			variant: 'danger',
			title: translate('admin.undoCheckIn'),
			message: translate('admin.undoCheckInMessage'),
		});

		if (confirmed) undoCheckIn(bookingId);
	};

	const handleOpenBookingAction = (booking: BookingWithDetails) => {
		openModal(ModalType.BookingCancel, { booking });
	};

	const handleOpenCompensation = (booking: BookingWithDetails) => {
		openModal(ModalType.CompensateBooking, { booking });
	};

	const handleOpenTransfer = (booking: BookingWithDetails) => {
		openModal(ModalType.TransferBooking, { booking });
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
						<p className="text-sm font-semibold text-gray-900 sm:text-base dark:text-gray-100">
							{translate('admin.allBookings')}
						</p>
						<p className="text-xs text-gray-500 sm:text-sm">
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
								applyFilter({ status: (value as BookingDisplayStatus) || undefined })
							}
							options={[
								{ value: '', label: translate('admin.allStatuses') },
								...BookingDisplayStatusEnum.options.map((s) => ({
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
						isActive={createdBy !== undefined}
						value={createdBy ?? ''}
							onValueChange={(value) =>
								applyFilter({ createdBy: (value as BookingAuthor) || undefined })
							}
							options={[
								{ value: '', label: translate('admin.anyAuthor') },
								...BookingAuthorSchema.options.map((author) => ({
									value: author,
									label:
										author === 'admin'
											? translate('admin.createdByAdminFilter')
											: translate('admin.createdByClientFilter'),
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

						<DateRangePicker
							value={
								tourFrom || tourTo
									? {
											from: parseDateParam(tourFrom ?? tourTo ?? null) ?? new Date(),
											to: parseDateParam(tourTo ?? tourFrom ?? null) ?? new Date(),
										}
									: null
							}
							onChange={(range) =>
								applyFilter({
									tourFrom: range ? formatDateParam(range.from) : undefined,
									tourTo: range ? formatDateParam(range.to) : undefined,
								})
							}
							placeholder={translate('admin.tourDate')}
							presets={tourPresets}
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

			<TimeZoneNote className="px-3 pb-2 sm:px-5" />

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
										{booking.user?.id ? (
											<Link
												href={localizePath(`/admin/users?search=${booking.user.id}`, locale)}
												className="text-primary font-medium hover:underline"
											>
												{booking.user.name || translate('booking.unknownCustomer')}
											</Link>
										) : (
											<p className="font-medium text-gray-900 dark:text-gray-100">
												{translate('booking.unknownCustomer')}
											</p>
										)}
										<p className="text-sm text-gray-500 dark:text-gray-400">{booking.user?.email || '—'}</p>
										{booking.user?.phone && (
											<p className="text-sm text-gray-500 dark:text-gray-400">{booking.user.phone}</p>
										)}
									</div>
								</TableCell>
								<TableCell>
									<div className="max-w-md min-w-0">
										{booking.occurrence?.event?.id ? (
											<Link
												href={localizePath(`/admin/events?search=${booking.occurrence.event.id}`, locale)}
												className="text-primary block truncate font-medium hover:underline"
											>
												{eventTranslation?.title || translate('booking.unknownEvent')}
											</Link>
										) : (
											<p className="truncate font-medium text-gray-900 dark:text-gray-100">
												{translate('booking.unknownEvent')}
											</p>
										)}
										<p className="truncate text-xs text-gray-500 sm:text-sm dark:text-gray-400">
											{eventTranslation?.location || '—'}
										</p>
									</div>
								</TableCell>
								<TableCell>
									<div className="flex flex-col items-start gap-1">
										<Badge
											label={BOOKING_STATUS_LABELS[getBookingDisplayStatus(booking)]}
											variant={getBookingStatusBadgeVariant(getBookingDisplayStatus(booking))}
										/>
										{booking.createdByAdminId && (
											<span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
												{translate('admin.manualBooking')}
											</span>
										)}
									</div>
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
									<div className="flex gap-2">
										<Button
											type="button"
											size="xs"
											variant="secondary"
											onClick={() => handleOpenBookingDetails(booking)}
										>
											<Eye className="h-4 w-4" />
										</Button>

										{getBookingDisplayStatus(booking) === 'CONFIRMED' && (
											<Button
												type="button"
												size="xs"
												variant="secondary"
												title={translate('admin.checkInBooking')}
												aria-label={translate('admin.checkInBooking')}
												disabled={isCheckingIn}
												onClick={() => handleCheckIn(booking.id)}
											>
												<UserCheck className="h-4 w-4" />
											</Button>
										)}

										{booking.checkedInAt && (
											<Button
												type="button"
												size="xs"
												variant="secondary"
												title={translate('admin.undoCheckIn')}
												aria-label={translate('admin.undoCheckIn')}
												disabled={isUndoingCheckIn}
												onClick={() => handleUndoCheckIn(booking.id)}
											>
												<Undo2 className="h-4 w-4" />
											</Button>
										)}

										{booking.status === 'PENDING' && (
											<Button
												type="button"
												size="xs"
												variant="primary"
												title={translate('admin.confirmBooking')}
												aria-label={translate('admin.confirmBooking')}
												onClick={() => openModal(ModalType.BookingConfirm, { booking })}
											>
												<CheckCircle className="h-4 w-4" />
											</Button>
										)}

										<Button
											type="button"
											size="xs"
											variant="secondary"
											onClick={() => openModal(ModalType.UpdateBooking, { booking })}
											disabled={booking.status !== 'CONFIRMED' || booking.quantity < 2}
										>
											<Pencil className="h-4 w-4" />
										</Button>

										<Button
											type="button"
											size="xs"
											variant="secondary"
											title={translate('admin.compensateBooking')}
											aria-label={translate('admin.compensateBooking')}
											onClick={() => handleOpenCompensation(booking)}
											disabled={Number(booking.amount) === 0}
										>
											<HandCoins className="h-4 w-4" />
										</Button>

										<Button
											type="button"
											size="xs"
											variant="secondary"
											title={translate('admin.transferBooking')}
											aria-label={translate('admin.transferBooking')}
											onClick={() => handleOpenTransfer(booking)}
											disabled={booking.status !== 'CONFIRMED' || Boolean(booking.checkedInAt)}
										>
											<CalendarClock className="h-4 w-4" />
										</Button>

										<Button
											type="button"
											size="xs"
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
