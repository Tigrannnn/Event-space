'use client';

import { useState, type FormEvent } from 'react';
import { CalendarDays, Pencil, Plus, Search, Trash2, Users, X } from 'lucide-react';
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
import {
	useAdminEvents,
	useDeleteEvent,
	useUpdateEventStatus,
} from '@/features/admin/hooks/useAdmin';
import { useModalStore, ModalType } from '@/stores';
import {
	Event,
	EventDifficulty,
	EventStatus,
	PaginatedResponse,
	EventStatusEnum,
	EventDifficultyEnum,
	TimeFilterSchema,
} from '@event-space/shared';
import type { TimeFilterType } from '@event-space/shared';
import { formatDateTime } from '@/utils/date';
import {
	EVENT_STATUS_LABELS,
	EVENT_DIFFICULTY_LABELS,
	TIME_FILTER_LABELS,
} from '@/constants/mappers';

const statusFilterOptions = [
	{ value: '', label: 'All statuses' },
	...EventStatusEnum.options.map((status) => ({
		value: status,
		label: EVENT_STATUS_LABELS[status],
	})),
];

const difficultyFilterOptions = [
	{ value: '', label: 'All difficulty' },
	...EventDifficultyEnum.options.map((difficulty) => ({
		value: difficulty,
		label: EVENT_DIFFICULTY_LABELS[difficulty],
	})),
];

const timeFilterOptions = [
	{ value: '', label: 'Any time' },
	...TimeFilterSchema.options.map((time) => ({
		value: time,
		label: TIME_FILTER_LABELS[time],
	})),
];

const pageSizeOptions = [10, 20, 50, 100].map((pageSize) => ({
	value: String(pageSize),
	label: `${pageSize} / page`,
}));

const eventStatusOptions = EventStatusEnum.options.map((status) => ({
	value: status,
	label: EVENT_STATUS_LABELS[status],
}));

interface EventsTableProps {
	initialEvents: PaginatedResponse<Event>;
}

function formatCurrency(value: Event['price']) {
	return new Intl.NumberFormat('en', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(Number(value));
}

export default function EventsTable({ initialEvents }: EventsTableProps) {
	const [skip, setSkip] = useState(initialEvents.skip);
	const [limit, setLimit] = useState(initialEvents.take);
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<EventStatus | undefined>();
	const [difficulty, setDifficulty] = useState<EventDifficulty | undefined>();
	const [time, setTime] = useState<TimeFilterType | undefined>();
	const { openModal } = useModalStore();
	const confirm = useConfirm();
	const { data, isFetching } = useAdminEvents({
		skip,
		limit,
		search: search || undefined,
		status,
		difficulty,
		time,
	});
	const updateEventStatus = useUpdateEventStatus();
	const deleteEvent = useDeleteEvent();
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const router = useRouter();
	const eventsResponse = data?.data ?? initialEvents;
	const pageStart = eventsResponse.total === 0 ? 0 : eventsResponse.skip + 1;
	const pageEnd = Math.min(eventsResponse.skip + eventsResponse.data.length, eventsResponse.total);
	const canGoPrevious = eventsResponse.skip > 0;
	const canGoNext = eventsResponse.hasMore && eventsResponse.nextSkip !== null;
	const hasActiveFilters = Boolean(
		search || status !== undefined || difficulty !== undefined || time !== undefined,
	);

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
		resetPagination();
	};

	const handleEventStatusChange = (eventId: string, nextStatus: EventStatus) => {
		updateEventStatus.mutate({ id: eventId, status: nextStatus });
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
		const confirmed = await confirm({
			title: 'Delete event',
			message: `Delete "${event.title}"? This will remove the event permanently.`,
			confirmText: 'Delete',
			variant: 'danger',
		});

		if (confirmed) {
			setDeletingId(event.id);
			deleteEvent.mutate(event.id, {
				onSettled: () => setDeletingId(null),
			});
		}
	};

	return (
		<>
			<div className="overflow-hidden rounded-lg border border-gray-500 shadow-sm">
				<div className="flex flex-col gap-4 px-3 py-3 sm:px-5 sm:py-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="font-semibold text-gray-900 dark:text-gray-100">All events</p>
							<p className="text-sm text-gray-500">
								Showing {pageStart}-{pageEnd} of {eventsResponse.total} events
							</p>
						</div>
						<Button type="button" size="sm" onClick={() => openModal(ModalType.CreateEvent)}>
							<Plus className="h-4 w-4" />
							Create event
						</Button>
					</div>

					<div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
						<form onSubmit={handleSearchSubmit} className="flex min-w-0 flex-1 gap-2">
							<div className="relative min-w-0 flex-1">
								<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
								<input
									value={searchInput}
									onChange={(event) => setSearchInput(event.target.value)}
									placeholder="Search title, category, location"
									className="focus:border-primary h-10 w-full rounded-md border border-gray-500 bg-transparent pr-3 pl-9 text-sm transition outline-none placeholder:text-gray-400"
								/>
							</div>
							<Button type="submit" size="sm" variant="secondary" disabled={isFetching}>
								Search
							</Button>
						</form>

						<div className="flex flex-wrap items-center gap-2">
							<Select
								value={status ?? ''}
								onValueChange={handleStatusFilterChange}
								options={statusFilterOptions}
							/>

							<Select
								value={difficulty ?? ''}
								onValueChange={handleDifficultyFilterChange}
								options={difficultyFilterOptions}
							/>

							<Select
								value={time ?? ''}
								onValueChange={handleTimeFilterChange}
								options={timeFilterOptions}
							/>

							<Select value={limit} onValueChange={handlePageSizeChange} options={pageSizeOptions} />

							{hasActiveFilters && (
								<Button type="button" size="sm" variant="secondary" onClick={handleResetFilters}>
									<X className="h-4 w-4" />
									Reset
								</Button>
							)}
						</div>
					</div>
				</div>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="px-3 sm:px-5">Event</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Difficulty</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Capacity</TableHead>
							<TableHead>Price</TableHead>
							<TableHead className="w-32">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{eventsResponse.data.length === 0 && (
							<TableRow>
								<TableCell colSpan={7} className="px-3 py-8 text-center text-gray-500 sm:px-5">
									No events found
								</TableCell>
							</TableRow>
						)}

						{eventsResponse.data.map((event) => (
							<TableRow key={event.id}>
								<TableCell className="px-3 sm:px-5">
									<div className="max-w-md min-w-0">
										<p className="truncate font-medium text-gray-900 dark:text-gray-100">{event.title}</p>
										<p className="truncate text-sm text-gray-500 dark:text-gray-400">
											{event.category} · {event.location}
										</p>
									</div>
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										<Select
											value={event.status}
											onValueChange={(value) => handleEventStatusChange(event.id, value as EventStatus)}
											disabled={updateEventStatus.isPending}
											size="sm"
											aria-label={`Update ${event.title} status`}
											options={eventStatusOptions}
										/>
									</div>
								</TableCell>
								<TableCell>{event.difficulty}</TableCell>
								<TableCell>
									<div className="flex items-center gap-2 text-sm">
										<CalendarDays className="h-4 w-4 text-gray-400" />
										{formatDateTime(event.date)}
									</div>
								</TableCell>
								<TableCell>
									{event.currentParticipants}/{event.maxParticipants}
								</TableCell>
								<TableCell>{formatCurrency(event.price)}</TableCell>
								<TableCell>
									<div className="flex gap-2">
										<Button
											type="button"
											size="xs"
											variant="secondary"
											onClick={() => openModal(ModalType.UpdateEvent, { event })}
											aria-label={`Edit ${event.title}`}
										>
											<Pencil className="h-4 w-4" />
										</Button>
										<Button
											type="button"
											size="xs"
											variant="secondary"
											onClick={() => router.push(`/admin/bookings?eventId=${event.id}`)}
											aria-label={`View bookings for ${event.title}`}
										>
											<Users className="h-4 w-4" />
										</Button>
										<Button
											type="button"
											size="xs"
											variant="danger"
											onClick={() => handleDelete(event)}
											isLoading={deletingId === event.id && deleteEvent.isPending}
											aria-label={`Delete ${event.title}`}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
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
