'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { eventApi } from '@/features/events/api/events.api';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/primitives/command';
import { formatDateTime } from '@/utils/date';
import type { Event } from '@event-space/shared';
import { getEventTranslation } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';

interface EventSearchSelectProps {
	value: string;
	onChange: (eventId: string, event: Event) => void;
	label?: string;
}

export default function EventSearchSelect({ value, onChange, label }: EventSearchSelectProps) {
	const translate = useTranslation();
	const locale = translate.locale;
	const [search, setSearch] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const { data, isLoading } = useQuery({
		queryKey: ['events-search', search],
		queryFn: () => eventApi.getEvents({ search, limit: 20 }),
		enabled: isOpen,
	});

	const events = data?.data ?? [];

	const handleSelect = (event: Event) => {
		setSelectedEvent(event);
		onChange(event.id, event);
		setIsOpen(false);
		setSearch('');
	};

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	return (
		<div className="space-y-1.5">
			{label && <span className="text-sm font-semibold">{label}</span>}
			<div className="relative" ref={containerRef}>
				<button
					type="button"
					onClick={() => setIsOpen((v) => !v)}
					className="focus:border-primary h-10 w-full cursor-pointer rounded-md border border-gray-500 bg-transparent px-3 text-left text-sm transition outline-none hover:border-gray-600"
				>
					{selectedEvent ? (
						<span className="text-gray-900 dark:text-gray-100">
							{getEventTranslation(selectedEvent, locale).title} — {formatDateTime(selectedEvent.date)}
						</span>
					) : (
						<span className="text-gray-400">{translate('admin.selectEvent')}</span>
					)}
				</button>

				{isOpen && (
					<div className="absolute top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
						<Command shouldFilter={false}>
							<CommandInput placeholder={translate('admin.searchEvents')} value={search} onValueChange={setSearch} />
							<CommandList>
								{isLoading && <div className="py-4 text-center text-sm text-gray-400">{translate('admin.loading')}</div>}
								{!isLoading && events.length === 0 && <CommandEmpty>{translate('admin.noEventsFound')}</CommandEmpty>}
								{!isLoading && events.length > 0 && (
									<CommandGroup>
										{events.map((event) => {
											const t = getEventTranslation(event, locale);
											return (
												<CommandItem
													key={event.id}
													value={event.id}
													onSelect={() => handleSelect(event)}
													data-checked={value === event.id}
													className="cursor-pointer duration-200 hover:bg-gray-100 hover:text-white dark:hover:bg-gray-900"
												>
													<div className="flex flex-col">
														<span className="font-medium">{t.title}</span>
														<span className="text-xs text-gray-400">
															{formatDateTime(event.date)} · {t.location}
														</span>
													</div>
												</CommandItem>
											);
										})}
									</CommandGroup>
								)}
							</CommandList>
						</Command>
					</div>
				)}
			</div>
		</div>
	);
}
