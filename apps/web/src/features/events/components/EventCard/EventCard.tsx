'use client';

import React from 'react';
import Button from '@/components/ui/Buttons/Button';
import { CategoryBadge } from '../CategoryBadge';
import { CapacityBar } from '../CapacityBar';

import { ModalType, useModalStore } from '@/stores';
import { formatDate } from '@/utils/date';
import Link from 'next/link';
import { EventImageWithFallback } from '../EventImage';
import { Event } from '@event-space/shared';

export interface EventCardProps {
	event: Event;
}

export default function EventCard({ event }: EventCardProps) {
	const { openModal } = useModalStore();

	const handleJoinClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		openModal(ModalType.Register);
	};

	return (
		<Link
			href={`/events/${event.id}`}
			className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl sm:rounded-4xl md:rounded-[2.5rem] dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20"
		>
			{/* Media Section */}
			<div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100 sm:aspect-16/10 dark:bg-gray-900">
				<CategoryBadge>{event.category}</CategoryBadge>
				<EventImageWithFallback
					src={event.images[0]}
					alt={event.title}
					onError={() => console.log('Image failed to load')}
				/>
			</div>

			{/* Content Section */}
			<div className="flex flex-1 flex-col p-4 sm:p-6 md:p-8">
				<div className="mb-3 flex items-center gap-2">
					<span className="bg-accent h-2 w-2 animate-pulse rounded-full" />
					<span className="text-accent text-[13px] font-bold tracking-wider uppercase sm:text-xs">
						{formatDate(event.date)}
					</span>
				</div>

				<h3 className="text-primary group-hover:text-accent mb-3 line-clamp-2 min-h-12 text-xl leading-tight font-black tracking-tight transition-colors sm:min-h-14 sm:text-2xl">
					{event.title}
				</h3>

				<p className="mb-4 line-clamp-2 min-h-10 text-base leading-relaxed font-medium text-gray-500 sm:mb-6 sm:min-h-11 sm:text-sm dark:text-gray-400">
					{event.description}
				</p>

				<div className="mb-4 flex items-center gap-2 sm:mb-6">
					<span className="text-base font-medium text-gray-400 italic sm:text-sm dark:text-gray-500">
						📍 {event.location}
					</span>
				</div>

				{/* Footer Section: Metrics & Action - always at bottom */}
				<div className="mt-auto space-y-4 border-t border-gray-50 pt-4 sm:space-y-6 sm:pt-6 dark:border-gray-700/50">
					<CapacityBar current={event.currentParticipants} max={event.maxParticipants} />

					<Button variant="primary" className="w-full" onClick={handleJoinClick}>
						Join Adventure
					</Button>
				</div>
			</div>
		</Link>
	);
}
