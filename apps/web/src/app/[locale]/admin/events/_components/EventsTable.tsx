'use client';

import { useState, type FormEvent } from 'react';
import { CalendarDays, Pencil, Plus, Search, Trash2, Users, X, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Buttons/Button';
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
	getApiErrorMessage,
} from '@event-space/shared';
import type { TimeFilterType } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
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
	const locale = translate.locale;
	const { formatDateTime } = useFormatDate();
	const formatCurrency = useFormatCurrency();
	const [skip, setSkip] = useState(initialEvents.skip);
	const [limit, setLimit] = useState(initialEvents.take);
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<EventStatus | undefined>();
	const [difficulty, setDifficulty] = useState<EventDifficulty | undefined>();
	const [time, setTime] = useState<TimeFilterType | undefined>();
	const [minPriceInput, setMinPriceInput] = useState('');
	const [minPrice, setMinPrice] = useState<number | undefined>();
	const [maxPriceInput, setMaxPriceInput] = useState('');
	const [maxPrice, setMaxPrice] = useState<number | undefined>();
	const { openModal } = useModalStore();
	const { addToast } = useToastStore();
	const confirm = useConfirm();
	const { data, isFetching } = useAdminEvents({
		skip,
		limit,
		search: search || undefined,
		status,
		difficulty,
		time,
		minPrice,
		maxPrice,
	});
	const deleteEvent = useDeleteEvent();
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const router = useRouter();
	const eventsResponse = data ?? initialEvents;
	const pageStart = eventsResponse.total === 0 ? 0 : eventsResponse.skip + 1;
	const pageEnd = Math.min(eventsResponse.skip + eventsResponse.data.length, eventsResponse.total);
	const canGoPrevious = eventsResponse.skip > 0;
	const canGoNext = eventsResponse.hasMore && eventsResponse.nextSkip !== null;
	const hasActiveFilters = Boolean(
		search ||
		status !== undefined ||
		difficulty !== undefined ||
		time !== undefined ||
		minPrice !== undefined ||
		maxPrice !== undefined,
	);
	const { EVENT_STATUS_LABELS, EVENT_DIFFICULTY_LABELS } = useLabels();
	const eventStatusOptions = EventStatusEnum.options.map((eventStatus) => ({
		value: eventStatus,
		label: EVENT_STATUS_LABELS[eventStatus],
	}));
	const eventDifficultyOptions = EventDifficultyEnum.options.map((diff) => ({
		value: diff,
		label: EVENT_DIFFICULTY_LABELS[diff],
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
		setStatus(value ? (value as EventStatus) : undefined);
		resetPagination();
	};

	const handleDifficultyFilterChange = (value: string) => {
		setDifficulty(value ? (value as EventDifficulty) : undefined);
		resetPagination();
	};

	const handleTimeFilterChange = (value: string) => {
		setTime(value ? (value as TimeFilterType) : undefined);
		resetPagination();
	};

	const handleMinPriceChange = (value: string) => {
		setMinPriceInput(value);
		setMinPrice(value ? Number(value) : undefined);
		resetPagination();
	};

	const handleMaxPriceChange = (value: string) => {
		setMaxPriceInput(value);
		setMaxPrice(value ? Number(value) : undefined);
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
		setDifficulty(undefined);
		setTime(undefined);
		setMinPriceInput('');
		setMinPrice(undefined);
		setMaxPriceInput('');
		setMaxPrice(undefined);
		resetPagination();
	};

	const handlePreviousPage = () => {
		setSkip((currentSkip) => Math.max(currentSkip - limit, 0));
	};

	const handleNextPage = () => {
		if (eventsResponse.nextSkip !== null) {
			setSkip(eventsResponse.nextSkip);
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
					const message = getApiErrorMessage(error, 'Could not delete event');
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

					<div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
						<form onSubmit={handleSearchSubmit} className="flex min-w-0 flex-1 gap-2">
							<div className="relative min-w-[75%] flex-1">
								<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
								<input
									value={searchInput}
									onChange={(event) => setSearchInput(event.target.value)}
									placeholder={translate('admin.searchEventsPlaceholder')}
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
								options={[{ value: '', label: translate('admin.allStatuses') }, ...eventStatusOptions]}
							/>

							<Select
								value={difficulty ?? ''}
								onValueChange={handleDifficultyFilterChange}
								options={[
									{ value: '', label: translate('admin.allDifficulty') },
									...eventDifficultyOptions,
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

							<div className="flex items-center gap-2">
								<input
									type="number"
									value={minPriceInput}
									onChange={(e) => handleMinPriceChange(e.target.value)}
									placeholder={translate('admin.minPrice')}
									className="h-10 w-32 rounded-md border border-gray-500 bg-transparent px-3 text-sm text-gray-900 dark:text-gray-100"
								/>
								<span className="text-sm text-gray-500">-</span>
								<input
									type="number"
									value={maxPriceInput}
									onChange={(e) => handleMaxPriceChange(e.target.value)}
									placeholder={translate('admin.maxPrice')}
									className="h-10 w-32 rounded-md border border-gray-500 bg-transparent px-3 text-sm text-gray-900 dark:text-gray-100"
								/>
							</div>

							<Select
								value={limit}
								onValueChange={handlePageSizeChange}
								options={pageSizeOptions.map((ps) => ({
									...ps,
									label: `${ps.value} ${translate('admin.pageSize')}`,
								}))}
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
							<TableHead className="px-3 sm:px-5">{translate('admin.event')}</TableHead>
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
