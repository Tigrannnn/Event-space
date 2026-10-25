'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import type { EventOccurrence } from '@event-space/shared';
import { useFormatDate } from '@/hooks/format';
import { centerInScroller, keepInView } from '@/utils/scroll';
import { useTranslation } from '@/hooks/translation';
import { OccurrencePrice } from '../OccurrencePrice';

export interface OccurrencePickerProps {
	occurrences: EventOccurrence[];
	selectedId?: string;
	onSelect: (occurrenceId: string) => void;
	price: number;
	disabled?: boolean;
}

const spotsOf = (occurrence: EventOccurrence): number =>
	Math.max(0, occurrence.maxParticipants - occurrence.currentParticipants);

export function OccurrencePicker({
	occurrences,
	selectedId,
	onSelect,
	price,
	disabled = false,
}: OccurrencePickerProps) {
	const translate = useTranslation();
	const { formatDateTime } = useFormatDate();
	const containerRef = useRef<HTMLDivElement>(null);
	const activeRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);

	const selectedIndex = occurrences.findIndex((occurrence) => occurrence.id === selectedId);
	const selected = selectedIndex >= 0 ? occurrences[selectedIndex] : undefined;

	useEffect(() => {
		if (!isOpen) return;

		const onPointerDown = (pointerEvent: MouseEvent | TouchEvent) => {
			if (!containerRef.current?.contains(pointerEvent.target as Node)) {
				setIsOpen(false);
			}
		};
		const onKeyDown = (keyEvent: KeyboardEvent) => {
			if (keyEvent.key === 'Escape') setIsOpen(false);
		};

		document.addEventListener('mousedown', onPointerDown);
		document.addEventListener('touchstart', onPointerDown);
		document.addEventListener('keydown', onKeyDown);

		return () => {
			document.removeEventListener('mousedown', onPointerDown);
			document.removeEventListener('touchstart', onPointerDown);
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [isOpen]);

	useEffect(() => {
		if (isOpen) centerInScroller(panelRef.current, activeRef.current);
	}, [isOpen]);

	useEffect(() => {
		if (isOpen) keepInView(panelRef.current, activeRef.current);
	}, [isOpen, activeIndex]);

	const open = () => {
		setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
		setIsOpen(true);
	};

	const pick = (occurrenceId: string) => {
		onSelect(occurrenceId);
		setIsOpen(false);
	};

	const onButtonKeyDown = (keyEvent: React.KeyboardEvent) => {
		if (keyEvent.key === 'ArrowDown' || keyEvent.key === 'ArrowUp') {
			keyEvent.preventDefault();
			if (!isOpen) {
				open();
				return;
			}
			setActiveIndex((current) => {
				const next = keyEvent.key === 'ArrowDown' ? current + 1 : current - 1;
				return Math.min(Math.max(next, 0), occurrences.length - 1);
			});
			return;
		}

		if (keyEvent.key === 'Enter' && isOpen) {
			keyEvent.preventDefault();
			const active = occurrences[activeIndex];
			if (active) pick(active.id);
		}
	};

	return (
		<div ref={containerRef} className="relative w-full">
			<button
				type="button"
				disabled={disabled || occurrences.length === 0}
				onClick={() => (isOpen ? setIsOpen(false) : open())}
				onKeyDown={onButtonKeyDown}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				className="focus:border-primary flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left shadow-sm transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800"
			>
				<span className="min-w-0 flex-1">
					<span className="block truncate text-sm font-semibold text-gray-800 dark:text-gray-200">
						{selected ? formatDateTime(selected.date) : translate('booking.selectDate')}
					</span>
					{selected && (
						<span className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
							<OccurrencePrice price={price} discountPercent={selected.discountPercent} />
							<span className="text-xs text-gray-500 dark:text-gray-400">
								{spotsOf(selected) > 0
									? `${spotsOf(selected)} ${translate('booking.spotsLeft')}`
									: translate('booking.soldOut')}
							</span>
						</span>
					)}
				</span>
				<ChevronDown
					className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
				/>
			</button>

			{isOpen && (
				<div
					ref={panelRef}
					role="listbox"
					className="absolute top-full right-0 left-0 z-30 mt-2 max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-xl dark:border-gray-700 dark:bg-gray-800"
				>
					{occurrences.map((occurrence, index) => {
						const spotsLeft = spotsOf(occurrence);
						const isSelected = occurrence.id === selectedId;
						const isActive = index === activeIndex;

						return (
							<button
								key={occurrence.id}
								ref={isActive ? activeRef : undefined}
								type="button"
								role="option"
								aria-selected={isSelected}
								disabled={spotsLeft === 0}
								onMouseEnter={() => setActiveIndex(index)}
								onClick={() => pick(occurrence.id)}
								className={`flex w-full items-start justify-between gap-3 rounded-lg px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
									isSelected
										? 'bg-primary/10 dark:bg-primary/20'
										: isActive
											? 'bg-gray-100 dark:bg-gray-700/60'
											: ''
								}`}
							>
								<span className="min-w-0">
									<span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
										{formatDateTime(occurrence.date)}
									</span>
									<OccurrencePrice
										price={price}
										discountPercent={occurrence.discountPercent}
										className="mt-1"
									/>
								</span>
								<span className="flex shrink-0 items-center gap-2">
									<span
										className={`text-xs ${spotsLeft === 0 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}
									>
										{spotsLeft === 0
											? translate('booking.soldOut')
											: `${spotsLeft} ${translate('booking.spotsLeft')}`}
									</span>
									{isSelected && <Check className="text-primary h-4 w-4" />}
								</span>
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
