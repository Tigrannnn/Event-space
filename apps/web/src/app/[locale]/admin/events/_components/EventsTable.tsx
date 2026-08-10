'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { addDays, endOfMonth, startOfMonth, startOfToday } from 'date-fns';
import { Pencil, Plus, Trash2, Users, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Buttons/Button';
import {
	DateRangePicker,
	PriceRangePicker,
	formatDateParam,
	parseDateParam,
	type DateRangePreset,
} from '@/components/filters';
import Select from '@/components/ui/Select';
import TablePagination from '@/components/ui/TablePagination';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/Table';
import { useConfirm } from '@/hooks/confirmModal';
import { useAdminEvents, useDeleteEvent } from '@/features/admin/hooks/useAdmin';
import { useModalStore, ModalType } from '@/stores';
import {
	Event,
	EventDifficulty,
	EventStatus,
	PaginatedResponse,
	EventStatusEnum,
	EventDifficultyEnum,
	TimeFilterSchema,
	getEventTranslation,
	getCategoryTranslation,
} from '@event-space/shared';
import type { SpotsFilterType, TimeFilterType } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { useApiError } from '@/hooks/apiError';
import { useUrlFilters } from '@/hooks/urlFilters';
import AdminFilterBar from '../../_components/AdminFilterBar';
import { useCategories } from '@/features/categories/hooks/useCategories';
import {
	countActiveEventsFilters,
	emptyEventsFilters,
	parseEventsFilters,
	serializeEventsFilters,
	type AdminEventsFilters,
} from './events-filters';
import Badge from '@/components/ui/Badge';
import { useFormatDate, useFormatCurrency } from '@/hooks/format';
import { useLabels } from '@/hooks/labels/useLabels';
import { ToastType, useToastStore } from '@/stores/toastStore';

const pageSizeOptions = [10, 20, 50, 100].map((pageSize) => ({
	value: String(pageSize),
	label: `${pageSize} / page`,
}));

interface EventsTableProps {
	initialEvents: PaginatedResponse<Event>;
}

export default function EventsTable({ initialEvents }: EventsTableProps) {
	const translate = useTranslation();
	const apiError = useApiError();
	const locale = translate.locale;
	const { formatDateTime } = useFormatDate();
	const formatCurrency = useFormatCurrency();
	const { filters, setFilters, resetFilters, activeCount } = useUrlFilters({
		parse: parseEventsFilters,
		serialize: serializeEventsFilters,
		empty: emptyEventsFilters,
		countActive: countActiveEventsFilters,
	});
	const { skip, limit, status, difficulty, time, category, minPrice, maxPrice, startDate, endDate, spots } =
		filters;

	// The same three shortcuts the public catalogue offers, so both sides of the product describe a
	// period the same way.
	const datePresets: DateRangePreset[] = [
		{
			key: 'today',
			label: translate('filters.today'),
			getRange: () => {
				const today = startOfToday();
				return { from: today, to: today };
			},
		},
		{
			key: 'weekend',
			label: translate('filters.thisWeekend'),
			getRange: () => {
				const today = startOfToday();
				const day = today.getDay();
				if (day === 6) return { from: today, to: addDays(today, 1) };
				if (day === 0) return { from: addDays(today, -1), to: today };
				const saturday = addDays(today, 6 - day);
				return { from: saturday, to: addDays(saturday, 1) };
			},
		},
		{
			key: 'month',
			label: translate('filters.thisMonth'),
			getRange: () => {
				const today = startOfToday();
				return { from: startOfMonth(today), to: endOfMonth(today) };
			},
		},
	];

	// The text box is uncontrolled by the URL until submitted, so typing doesn't refetch on
	// every keystroke or fill browser history.
	const [searchInput, setSearchInput] = useState(filters.search ?? '');
	useEffect(() => {
		setSearchInput(filters.search ?? '');
	}, [filters.search]);

	const { openModal } = useModalStore();
	const { addToast } = useToastStore();
	const confirm = useConfirm();

	const { data, isFetching } = useAdminEvents(filters);

	const deleteEvent = useDeleteEvent();
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const router = useRouter();
	const eventsResponse = data ?? initialEvents;
	const pageStart = eventsResponse.total === 0 ? 0 : eventsResponse.skip + 1;
	const pageEnd = Math.min(eventsResponse.skip + eventsResponse.data.length, eventsResponse.total);
	const canGoPrevious = eventsResponse.skip > 0;
	const canGoNext = eventsResponse.hasMore && eventsResponse.nextSkip !== null;
	const hasActiveFilters = activeCount > 0;

	/**
	 * Slider ends for the price filter.
	 *
	 * Taken from the page on screen, then widened to cover whatever is already applied — otherwise
	 * filtering to "from 40 000" would leave the slider unable to express the very filter it is
	 * displaying, because the rows it derives from no longer contain anything cheaper.
	 */
	const priceBounds = useMemo(() => {
		const prices = eventsResponse.data.map((event) => Number(event.price));
		const highest = Math.max(1000, ...prices, minPrice ?? 0, maxPrice ?? 0);

		return { min: 0, max: Math.ceil(highest / 1000) * 1000 };
	}, [eventsResponse.data, minPrice, maxPrice]);

	const { EVENT_STATUS_LABELS, EVENT_DIFFICULTY_LABELS } = useLabels();
	const eventStatusOptions = EventStatusEnum.options.map((eventStatus) => ({
		value: eventStatus,
		label: EVENT_STATUS_LABELS[eventStatus],
	}));
	const eventDifficultyOptions = EventDifficultyEnum.options.map((diff) => ({
		value: diff,
		label: EVENT_DIFFICULTY_LABELS[diff],
	}));

	// Filtering happens by slug, matching the public site and keeping the URL readable.
	const { data: categories = [] } = useCategories();
	const categoryOptions = categories.map((item) => ({
		value: item.slug,
		label: getCategoryTranslation(item, locale)?.name ?? item.slug,
	}));

	/** Any filter change returns to the first page — page 5 of the old result set is meaningless. */
	const applyFilter = (patch: Partial<AdminEventsFilters>) => {
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

	const handlePreviousPage = () => {
		setFilters({ ...filters, skip: Math.max(skip - limit, 0) });
	};

	const handleNextPage = () => {
		if (eventsResponse.nextSkip !== null) {
			setFilters({ ...filters, skip: eventsResponse.nextSkip });
		}
	};

	const handleDelete = async (event: Event) => {
		const eventTranslation = getEventTranslation(event, locale);
		const confirmed = await confirm({
			title: translate('admin.deleteEvent'),
			message: `${translate('admin.deleteEventMessage')} "${eventTranslation.title}"`,
			confirmText: translate('admin.delete'),
			variant: 'danger',
		});

		if (confirmed) {
			setDeletingId(event.id);
			deleteEvent.mutate(event.id, {
				onSettled: () => setDeletingId(null),
				onError: (error) => {
					const message = apiError(error, 'admin.deleteEventFailed');
					addToast(message, ToastType.ERROR);
				},
			});
		}
	};

	return (
		<>
			<div className="overflow-hidden rounded-lg border border-gray-500 shadow-sm">
				<div className="flex flex-col gap-4 px-3 py-3 sm:px-5 sm:py-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="font-semibold text-gray-900 dark:text-gray-100">
								{translate('admin.allEvents')}
							</p>
							<p className="text-sm text-gray-500">
								{translate('admin.showing')} {pageStart}-{pageEnd} {translate('admin.of')}{' '}
								{eventsResponse.total} {translate('admin.eventsCount')}
							</p>
						</div>
						<Button type="button" size="sm" onClick={() => openModal(ModalType.CreateEvent)}>
							<Plus className="h-4 w-4" />
							{translate('admin.createEvent')}
						</Button>
					</div>

					<AdminFilterBar
						searchValue={searchInput}
						onSearchValueChange={setSearchInput}
						onSearchSubmit={handleSearchSubmit}
						searchPlaceholder={translate('admin.searchEventsPlaceholder')}
						isFetching={isFetching}
						activeCount={activeCount}
						showReset={hasActiveFilters}
						onReset={handleResetFilters}
					>
						<DateRangePicker
							value={
								startDate || endDate
									? {
										from: parseDateParam(startDate ?? endDate ?? null) ?? new Date(),
										to: parseDateParam(endDate ?? startDate ?? null) ?? new Date(),
									}
									: null
							}
							onChange={(range) =>
								applyFilter({
									startDate: range ? formatDateParam(range.from) : undefined,
									endDate: range ? formatDateParam(range.to) : undefined,
								})
							}
							placeholder={translate('admin.eventPeriod')}
							withActions
							// Deliberately not restricted to future dates: an admin needs to pull up last
							// season's events as readily as next month's.
							presets={datePresets}
						/>

						<PriceRangePicker
							value={
								minPrice !== undefined || maxPrice !== undefined
									? { min: minPrice ?? priceBounds.min, max: maxPrice ?? priceBounds.max }
									: null
							}
							onChange={(range) =>
								applyFilter({ minPrice: range?.min, maxPrice: range?.max })
							}
							bounds={priceBounds}
							placeholder={translate('admin.price')}
							withActions
						/>

						<Select
							variant="filter"
							size="sm"
							isActive={status !== undefined}
							value={status ?? ''}
							onValueChange={(value) => applyFilter({ status: (value as EventStatus) || undefined })}
							options={[{ value: '', label: translate('admin.allStatuses') }, ...eventStatusOptions]}
						/>

						<Select
							variant="filter"
							size="sm"
							isActive={difficulty !== undefined}
							value={difficulty ?? ''}
							onValueChange={(value) =>
								applyFilter({ difficulty: (value as EventDifficulty) || undefined })
							}
							options={[{ value: '', label: translate('admin.allDifficulty') }, ...eventDifficultyOptions]}
						/>

						<Select
							variant="filter"
							size="sm"
							isActive={category !== undefined}
							value={category ?? ''}
							onValueChange={(value) => applyFilter({ category: value || undefined })}
							options={[{ value: '', label: translate('admin.allCategories') }, ...categoryOptions]}
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
							isActive={spots !== undefined}
							value={spots ?? ''}
							onValueChange={(value) => applyFilter({ spots: (value as SpotsFilterType) || undefined })}
							options={[
								{ value: '', label: translate('admin.anySpots') },
								{ value: 'available', label: translate('admin.spotsAvailable') },
								{ value: 'full', label: translate('admin.spotsFull') },
								{ value: 'empty', label: translate('admin.spotsEmpty') },
							]}
						/>

						<Select
							variant="filter"
							size="sm"
							value={limit}
							onValueChange={(value) => applyFilter({ limit: Number(value) })}
							options={pageSizeOptions.map((ps) => ({
								...ps,
								label: `${ps.value} ${translate('admin.pageSize')}`,
							}))}
						/>
					</AdminFilterBar>
				</div>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="px-3 sm:px-5">{translate('admin.event')}</TableHead>
							<TableHead>{translate('admin.category')}</TableHead>
							<TableHead>{translate('admin.organizer')}</TableHead>
							<TableHead>{translate('admin.status')}</TableHead>
							<TableHead>{translate('admin.price')}</TableHead>
							<TableHead className="w-32">{translate('admin.actions')}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{eventsResponse.data.length === 0 && (
							<TableRow>
								<TableCell colSpan={7} className="px-3 py-8 text-center text-gray-500 sm:px-5">
									{translate('admin.noEventsFound')}
								</TableCell>
							</TableRow>
						)}

						{eventsResponse.data.map((event) => {
							const eventTranslation = getEventTranslation(event, locale);
							const categoryTranslation = getCategoryTranslation(event.category, locale);
							return (
								<TableRow key={event.id}>
									<TableCell className="px-3 sm:px-5">
										<div className="max-w-md min-w-0">
											<button
												type="button"
												onClick={() => router.push(`/events/${event.id}`)}
												className="text-primary cursor-pointer truncate text-left font-medium transition hover:underline"
											>
												{eventTranslation.title}
											</button>
											<p className="truncate text-sm text-gray-500 dark:text-gray-400">
												{categoryTranslation.name || '-'} · {eventTranslation.location}
											</p>
										</div>
									</TableCell>
									<TableCell>
										<div className="max-w-md min-w-0">
											<button
												type="button"
												onClick={() => {
													router.push(`/admin/categories?search=${event.category?.id}`);
												}}
												className="text-primary mt-1 block text-left font-medium hover:underline"
											>
												{categoryTranslation.name || '-'}
											</button>
										</div>
									</TableCell>
									<TableCell>
										<div className="max-w-md min-w-0">
											<button
												type="button"
												onClick={() => {
													router.push(`/admin/users?search=${event.organizer?.id}`);
												}}
												className="text-primary mt-1 block text-left font-medium hover:underline"
											>
												{event.organizer?.name ?? '—'}
											</button>
											<p className="truncate text-sm text-gray-500 dark:text-gray-400">
												{event.organizer?.email}
											</p>
											<p className="truncate text-sm text-gray-500 dark:text-gray-400">
												{event.organizer?.phone || '-'}
											</p>
										</div>
									</TableCell>
									<TableCell>
										<Badge label={EVENT_STATUS_LABELS[event.status]} />
									</TableCell>
									<TableCell suppressHydrationWarning>{formatCurrency(event.price)}</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Button
												type="button"
												size="xs"
												variant="secondary"
												onClick={() => openModal(ModalType.EventDetails, { event })}
												aria-label={`${translate('admin.viewDetails')}: ${eventTranslation.title}`}
											>
												<Eye className="h-4 w-4" />
											</Button>
											<Button
												type="button"
												size="xs"
												variant="secondary"
												onClick={() => openModal(ModalType.UpdateEvent, { event })}
												aria-label={`${translate('admin.edit')}: ${eventTranslation.title}`}
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												type="button"
												size="xs"
												variant="secondary"
												onClick={() => router.push(`/admin/bookings?eventId=${event.id}`)}
												aria-label={`${translate('admin.viewBookings')}: ${eventTranslation.title}`}
											>
												<Users className="h-4 w-4" />
											</Button>
											<Button
												type="button"
												size="xs"
												variant="danger"
												onClick={() => handleDelete(event)}
												isLoading={deletingId === event.id && deleteEvent.isPending}
												aria-label={`${translate('admin.delete')}: ${eventTranslation.title}`}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>

				<TablePagination
					skip={eventsResponse.skip}
					limit={limit}
					isLoading={isFetching}
					canGoPrevious={canGoPrevious}
					canGoNext={canGoNext}
					onPreviousPage={handlePreviousPage}
					onNextPage={handleNextPage}
				/>
			</div>
		</>
	);
}
