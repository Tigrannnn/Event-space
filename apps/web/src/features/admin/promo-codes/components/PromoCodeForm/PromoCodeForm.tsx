'use client';

import { useEffect, useRef, useState } from 'react';
import { ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button';
import Input from '@/components/ui/Inputs/Input';
import Select from '@/components/ui/Select';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/primitives/command';
import { useTranslation } from '@/hooks/translation';
import { useAdminCategories, useAdminEvents } from '@/features/admin/hooks/useAdmin';
import { useEventById } from '@/features/events';
import { getCategoryTranslation, getEventTranslation } from '@event-space/shared';
import type { CreatePromoCodeData, PromoCode } from '@event-space/shared';

interface PromoCodeFormProps {
	promoCode?: PromoCode;
	isPending: boolean;
	submitLabel: string;
	onCancel: () => void;
	onSubmit: (data: CreatePromoCodeData) => void;
}

type PromoScope = 'all' | 'event' | 'category';

/** `type="date"` inputs hand back `''` when cleared — that must become "omit this field",
 *  not a string the API's date parser will choke on. */
function dateInputValue(value: string | Date | null | undefined): string {
	if (!value) return '';
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

export default function PromoCodeForm({
	promoCode,
	isPending,
	submitLabel,
	onCancel,
	onSubmit,
}: PromoCodeFormProps) {
	const translate = useTranslation();
	const locale = translate.locale;

	const [code, setCode] = useState(promoCode?.code ?? '');
	const [discountPercent, setDiscountPercent] = useState(String(promoCode?.discountPercent ?? ''));
	const [maxUses, setMaxUses] = useState(promoCode?.maxUses != null ? String(promoCode.maxUses) : '');
	const [maxUsesPerUser, setMaxUsesPerUser] = useState(
		promoCode?.maxUsesPerUser != null ? String(promoCode.maxUsesPerUser) : '',
	);
	const [validFrom, setValidFrom] = useState(dateInputValue(promoCode?.validFrom));
	const [validUntil, setValidUntil] = useState(dateInputValue(promoCode?.validUntil));
	const [active, setActive] = useState(promoCode?.active ?? true);
	const [note, setNote] = useState(promoCode?.note ?? '');

	const [scope, setScope] = useState<PromoScope>(
		promoCode?.eventId ? 'event' : promoCode?.categoryId ? 'category' : 'all',
	);
	const [eventId, setEventId] = useState<string | null>(promoCode?.eventId ?? null);
	const [categoryId, setCategoryId] = useState<string | null>(promoCode?.categoryId ?? null);

	const [eventSearch, setEventSearch] = useState('');
	const [isEventPickerOpen, setIsEventPickerOpen] = useState(false);
	const eventPickerRef = useRef<HTMLDivElement>(null);

	const { data: selectedEvent } = useEventById(eventId ?? '', { enabled: Boolean(eventId) });
	const { data: eventsResponse, isLoading: isEventsLoading } = useAdminEvents(
		{ search: eventSearch, limit: 10 },
		{ enabled: scope === 'event' },
	);
	const events = eventsResponse?.data ?? [];

	const { data: categoriesResponse } = useAdminCategories({ limit: 100 }, { enabled: scope === 'category' });
	const categories = categoriesResponse?.data ?? [];

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (eventPickerRef.current && !eventPickerRef.current.contains(e.target as Node)) {
				setIsEventPickerOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleScopeChange = (next: PromoScope) => {
		setScope(next);
		if (next !== 'event') setEventId(null);
		if (next !== 'category') setCategoryId(null);
	};

	const percent = Number(discountPercent);
	const isValid =
		code.trim().length >= 3 &&
		Number.isInteger(percent) &&
		percent >= 1 &&
		percent <= 100 &&
		(scope !== 'event' || Boolean(eventId)) &&
		(scope !== 'category' || Boolean(categoryId));

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (!isValid) return;

		onSubmit({
			code: code.trim(),
			discountPercent: percent,
			maxUses: maxUses.trim() ? Number(maxUses) : undefined,
			maxUsesPerUser: maxUsesPerUser.trim() ? Number(maxUsesPerUser) : undefined,
			validFrom: validFrom ? new Date(validFrom) : undefined,
			validUntil: validUntil ? new Date(validUntil) : undefined,
			active,
			note: note.trim() || undefined,
			// Explicit null, not undefined: on edit this must actually clear whichever
			// scope the code no longer belongs to, not silently leave the old one in place.
			eventId: scope === 'event' ? eventId : null,
			categoryId: scope === 'category' ? categoryId : null,
		});
	};

	const scopeOptions: { value: PromoScope; label: string }[] = [
		{ value: 'all', label: translate('admin.promoScopeAll') },
		{ value: 'event', label: translate('admin.promoScopeEvent') },
		{ value: 'category', label: translate('admin.promoScopeCategory') },
	];

	return (
		<form onSubmit={handleSubmit} className="p-5 sm:p-6">
			<ModalHeader
				title={promoCode ? translate('admin.updatePromoCodeModal') : translate('admin.createPromoCodeModal')}
				onClose={onCancel}
			/>

			<div className="mt-4 space-y-4">
				<Input
					label={translate('admin.promoCodeCode')}
					value={code}
					onChange={(event) => setCode(event.target.value.toUpperCase())}
					placeholder="SUMMER10"
					required
				/>

				<Input
					label={translate('admin.promoCodeDiscountPercent')}
					type="number"
					min={1}
					max={100}
					value={discountPercent}
					onChange={(event) => setDiscountPercent(event.target.value)}
					required
				/>

				<div className="space-y-1.5">
					<span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
						{translate('admin.promoScope')}
					</span>
					<div className="flex gap-2">
						{scopeOptions.map((option) => (
							<button
								key={option.value}
								type="button"
								onClick={() => handleScopeChange(option.value)}
								className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
									scope === option.value
										? 'bg-primary text-white'
										: 'border border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-400'
								}`}
							>
								{option.label}
							</button>
						))}
					</div>

					{scope === 'event' && (
						<div className="relative" ref={eventPickerRef}>
							<button
								type="button"
								onClick={() => setIsEventPickerOpen((v) => !v)}
								className="focus:border-primary h-10 w-full cursor-pointer rounded-md border border-gray-500 bg-transparent px-3 text-left text-sm transition outline-none hover:border-gray-600"
							>
								{selectedEvent ? (
									<span className="block truncate text-gray-900 dark:text-gray-100">
										{getEventTranslation(selectedEvent, locale).title}
									</span>
								) : (
									<span className="text-gray-400">{translate('admin.promoCodeSelectEvent')}</span>
								)}
							</button>

							{isEventPickerOpen && (
								<div className="absolute top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
									<Command shouldFilter={false}>
										<CommandInput
											placeholder={translate('admin.promoCodeSearchEventsPlaceholder')}
											value={eventSearch}
											onValueChange={setEventSearch}
										/>
										<CommandList>
											{isEventsLoading && (
												<div className="py-4 text-center text-sm text-gray-400">
													{translate('admin.loading')}
												</div>
											)}
											{!isEventsLoading && events.length === 0 && (
												<CommandEmpty>{translate('admin.promoCodeNoEventsFound')}</CommandEmpty>
											)}
											{!isEventsLoading && events.length > 0 && (
												<CommandGroup>
													{events.map((event) => (
														<CommandItem
															key={event.id}
															value={event.id}
															onSelect={() => {
																setEventId(event.id);
																setIsEventPickerOpen(false);
																setEventSearch('');
															}}
															data-checked={eventId === event.id}
															className="cursor-pointer"
														>
															{getEventTranslation(event, locale).title}
														</CommandItem>
													))}
												</CommandGroup>
											)}
										</CommandList>
									</Command>
								</div>
							)}
						</div>
					)}

					{scope === 'category' && (
						<Select
							value={categoryId ?? ''}
							onValueChange={(value) => setCategoryId(value || null)}
							options={[
								{ value: '', label: translate('admin.promoCodeSelectCategory'), disabled: true },
								...categories.map((category) => ({
									value: category.id,
									label: getCategoryTranslation(category, locale).name,
								})),
							]}
						/>
					)}
				</div>

				<div className="grid grid-cols-2 gap-4">
					<Input
						label={translate('admin.promoCodeMaxUses')}
						type="number"
						min={1}
						value={maxUses}
						onChange={(event) => setMaxUses(event.target.value)}
						placeholder={translate('admin.promoCodeUnlimited')}
					/>
					<Input
						label={translate('admin.promoCodeMaxUsesPerUser')}
						type="number"
						min={1}
						value={maxUsesPerUser}
						onChange={(event) => setMaxUsesPerUser(event.target.value)}
						placeholder={translate('admin.promoCodeUnlimited')}
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<Input
						label={translate('admin.promoCodeValidFrom')}
						type="date"
						value={validFrom}
						onChange={(event) => setValidFrom(event.target.value)}
					/>
					<Input
						label={translate('admin.promoCodeValidUntil')}
						type="date"
						value={validUntil}
						onChange={(event) => setValidUntil(event.target.value)}
					/>
				</div>

				<Input
					label={translate('admin.promoCodeNote')}
					value={note}
					onChange={(event) => setNote(event.target.value)}
				/>

				<label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
					<input
						type="checkbox"
						checked={active}
						onChange={(event) => setActive(event.target.checked)}
						className="h-4 w-4"
					/>
					{translate('admin.active')}
				</label>
			</div>

			<div className="mt-6 flex gap-3">
				<Button type="button" variant="secondary" onClick={onCancel} disabled={isPending} className="flex-1">
					{translate('booking.cancel')}
				</Button>
				<Button type="submit" variant="primary" isLoading={isPending} disabled={!isValid || isPending} className="flex-1">
					{submitLabel}
				</Button>
			</div>
		</form>
	);
}
