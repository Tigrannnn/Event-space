'use client';

import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Event, EventStatusEnum, EventDifficultyEnum } from '@event-space/shared';
import { EventFormSchema, type EventFormValues } from './event-form.schema';
import { mapEventToFormValues } from './form-mappers';
import DateTimeField from './DateTimeField';
import Button from '@/components/ui/Buttons/Button';
import Select from '@/components/ui/Select';
import { ModalHeader } from '@/components/ui/Modal';
import { EVENT_STATUS_LABELS, EVENT_DIFFICULTY_LABELS } from '@/constants/mappers';
import { ImageUploader } from '@/components/ui/ImageUploader';
import CancellationPolicyInfo from '@/components/shared/CancellationPolicyInfo';
import { useState } from 'react';
import { useTranslation } from '@/hooks/translation';

interface EventFormProps {
	submitLabel: string;
	event?: Event;
	isPending: boolean;
	onCancel: () => void;
	onSubmit: (values: EventFormValues) => void;
}

const AVAILABLE_LOCALES = [
    { value: 'ru', label: '🇷🇺 Ru' },
    { value: 'en', label: '🇬🇧 En' },
    { value: 'hy', label: '🇦🇲 Hy' },
] as const;

const difficultyOptions = EventDifficultyEnum.options.map((diff) => ({
	value: diff,
	label: EVENT_DIFFICULTY_LABELS[diff],
}));

const statusOptions = EventStatusEnum.options.map((status) => ({
	value: status,
	label: EVENT_STATUS_LABELS[status],
}));

const fieldClassName =
	'focus:border-primary h-10 w-full rounded-md border border-gray-500 bg-transparent px-3 text-sm outline-none text-gray-900 dark:text-gray-100 ' +
	'[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

const dateTimeInputClassName =
	fieldClassName + ' cursor-pointer [color-scheme:light] dark:[color-scheme:dark]';

const textareaClassName =
	'focus:border-primary w-full resize-y rounded-md border border-gray-500 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-gray-400 text-gray-900 dark:text-gray-100 min-h-[100px]';

export default function EventForm({
	submitLabel,
	event,
	isPending,
	onCancel,
	onSubmit,
}: EventFormProps) {
	const translate = useTranslation();
	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<EventFormValues>({
		resolver: zodResolver(EventFormSchema),
		defaultValues: mapEventToFormValues(event),
	});

	const watchedDate = useWatch({ control, name: 'date' });
	const watchedPrice = useWatch({ control, name: 'price' });
	const watchedRules = useWatch({ control, name: 'cancellationRules' });
	const watchedTranslations = useWatch({ control, name: 'translations' }) ?? [];

	const { fields: translationFields, append: appendTranslation, remove: removeTranslation } = useFieldArray({
		control,
		name: 'translations',
	});

	const { fields: cancellationFields, append: appendCancellation, remove: removeCancellation } = useFieldArray({
		control,
		name: 'cancellationRules',
	});

	const [activeTabIndex, setActiveTabIndex] = useState(0);

	const addedLocales = watchedTranslations.map(t => t.locale);
	const availableLocalesToAdd = AVAILABLE_LOCALES.filter(locale => !addedLocales.includes(locale.value));

	const hasTranslationErrors = (index: number) => {
		return !!errors.translations?.[index];
	};

	const handleFormSubmit = (values: EventFormValues) => {
		onSubmit(values);
	};

	return (
		<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 p-5 sm:p-6">
			<ModalHeader title={event ? translate('admin.updateEvent') : translate('admin.createEvent')} onClose={onCancel} />

			<div className="space-y-4">
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
							Translations
						</h3>
						<div className="flex items-center gap-2">
							{availableLocalesToAdd.map((locale) => (
								<Button
									key={locale.value}
									type="button"
									variant="secondary"
									className="h-8 text-xs"
									disabled={isPending}
									onClick={() => appendTranslation({
										locale: locale.value,
										title: '',
										description: '',
										category: '',
										location: '',
										whatsIncluded: '',
									})}
								>
									+ {locale.label}
								</Button>
							))}
						</div>
					</div>

					<div className="flex flex-wrap gap-2">
						{translationFields.map((field, index) => {
							const localeInfo = AVAILABLE_LOCALES.find(l => l.value === field.locale);
							const hasError = hasTranslationErrors(index);
							const isActive = activeTabIndex === index;

							return (
								<div
									key={field.id}
									className={`flex items-center gap-2 px-3 py-2 rounded-t-lg border-t border-x border-b-0 cursor-pointer transition-colors ${
										isActive
											? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
											: 'bg-transparent border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
									} ${hasError ? 'border-b-2 border-red-500' : ''}`}
									onClick={() => setActiveTabIndex(index)}
								>
									<span className={`text-sm font-medium ${hasError ? 'text-red-500' : ''}`}>
										{localeInfo?.label || field.locale}
									</span>
									{translationFields.length > 1 && (
										<button
											type="button"
											className="ml-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded p-0.5"
											disabled={isPending}
											onClick={(e) => {
												e.stopPropagation();
												removeTranslation(index);
												if (activeTabIndex >= translationFields.length - 1 && activeTabIndex > 0) {
													setActiveTabIndex(activeTabIndex - 1);
												}
											}}
										>
											✕
										</button>
									)}
								</div>
							);
						})}
					</div>

					{translationFields.length > 0 && activeTabIndex < translationFields.length && (
						<div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<label className="space-y-1.5">
									<span className="text-sm font-semibold">{translate('admin.title')}</span>
									<input
										{...register(`translations.${activeTabIndex}.title`)}
										className={fieldClassName}
										disabled={isPending}
									/>
									{errors.translations?.[activeTabIndex]?.title && (
										<p className="text-xs text-red-500">{errors.translations[activeTabIndex]?.title?.message}</p>
									)}
								</label>
								<label className="space-y-1.5">
									<span className="text-sm font-semibold">{translate('admin.category')}</span>
									<input
										{...register(`translations.${activeTabIndex}.category`)}
										className={fieldClassName}
										disabled={isPending}
									/>
									{errors.translations?.[activeTabIndex]?.category && (
										<p className="text-xs text-red-500">{errors.translations[activeTabIndex]?.category?.message}</p>
									)}
								</label>
							</div>

							<div className="grid grid-cols-1 gap-4">
								<label className="space-y-1.5">
									<span className="text-sm font-semibold">{translate('admin.location')}</span>
									<input
										{...register(`translations.${activeTabIndex}.location`)}
										className={fieldClassName}
										disabled={isPending}
									/>
									{errors.translations?.[activeTabIndex]?.location && (
										<p className="text-xs text-red-500">{errors.translations[activeTabIndex]?.location?.message}</p>
									)}
								</label>
							</div>

							<label className="block space-y-1.5">
								<span className="text-sm font-semibold">{translate('admin.description')}</span>
								<textarea
									{...register(`translations.${activeTabIndex}.description`)}
									className={textareaClassName}
									disabled={isPending}
								/>
								{errors.translations?.[activeTabIndex]?.description && (
									<p className="text-xs text-red-500">{errors.translations[activeTabIndex]?.description?.message}</p>
								)}
							</label>

							<label className="block space-y-1.5">
								<span className="text-sm font-semibold">{translate('admin.includedItems')}</span>
								<textarea
									{...register(`translations.${activeTabIndex}.whatsIncluded`)}
									className={textareaClassName}
									disabled={isPending}
								/>
								{errors.translations?.[activeTabIndex]?.whatsIncluded && (
									<p className="text-xs text-red-500">{errors.translations[activeTabIndex]?.whatsIncluded?.message}</p>
								)}
							</label>
						</div>
					)}
				</div>

				<div className="grid grid-cols-1 gap-4">
					<label className="space-y-1.5">
						<span className="text-sm font-semibold">{translate('admin.googleMapsUrl')}</span>
						<input
							{...register('locationUrl')}
							className={fieldClassName}
							disabled={isPending}
							placeholder="https://maps.app.goo.gl/..."
						/>
						{errors.locationUrl && <p className="text-xs text-red-500">{errors.locationUrl.message}</p>}
					</label>
				</div>

				<div className="space-y-1.5">
					<span className="text-sm font-semibold">{translate('admin.dateTime')}</span>
					<Controller
						name="date"
						control={control}
						render={({ field }) => (
							<DateTimeField
								value={field.value}
								onChange={field.onChange}
								disabled={isPending}
								inputClassName={dateTimeInputClassName}
							/>
						)}
					/>
					{errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
				</div>

				<hr className="border-gray-200 dark:border-gray-700" />

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-1.5">
					<span className="text-sm font-semibold">{translate('admin.difficulty')} <span className="text-gray-400">(optional)</span></span>
					<Controller
						name="difficulty"
						control={control}
						render={({ field }) => (
							<Select
								value={field.value || ''}
									onValueChange={field.onChange}
									options={difficultyOptions}
									className="w-full"
									disabled={isPending}
								/>
							)}
						/>
						{errors.difficulty && <p className="text-xs text-red-500">{errors.difficulty.message}</p>}
					</div>
					<div className="space-y-1.5">
						<span className="text-sm font-semibold">{translate('admin.status')}</span>
						<Controller
							name="status"
							control={control}
							render={({ field }) => (
								<Select
									value={field.value}
									onValueChange={field.onChange}
									options={statusOptions}
									className="w-full"
									disabled={isPending}
								/>
							)}
						/>
						{errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
					</div>
				</div>

				<div className="grid grid-cols-3 gap-4">
					<label className="space-y-1.5">
						<span className="text-sm font-semibold">{translate('admin.price')}</span>
						<input
							type="number"
							step="0.01"
							{...register('price')}
							className={fieldClassName}
							disabled={isPending}
						/>
						{errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
					</label>
					<label className="space-y-1.5">
						<span className="text-sm font-semibold">{translate('admin.durationMin')}</span>
						<input
							type="number"
							{...register('duration')}
							className={fieldClassName}
							disabled={isPending}
						/>
						{errors.duration && <p className="text-xs text-red-500">{errors.duration.message}</p>}
					</label>
					<label className="space-y-1.5">
						<span className="text-sm font-semibold">{translate('admin.maxParticipants')}</span>
						<input
							type="number"
							{...register('maxParticipants')}
							className={fieldClassName}
							disabled={isPending}
						/>
						{errors.maxParticipants && (
							<p className="text-xs text-red-500">{errors.maxParticipants.message}</p>
						)}
					</label>
				</div>

				<hr className="border-gray-200 dark:border-gray-700" />

				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
								{translate('admin.cancellationRules')}
							</h3>
							<p className="text-xs text-gray-500">
								Define refund percentages based on time thresholds before the event starts.
							</p>
						</div>
						<Button
							type="button"
							variant="secondary"
							className="h-8 text-xs"
							disabled={isPending}
							onClick={() => appendCancellation({ hoursBeforeEvent: 24, refundPercentage: 50 })}
						>
							{translate('admin.addRule')}
						</Button>
					</div>

					{cancellationFields.length > 0 ? (
						<div className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
							{cancellationFields.map((field, index) => (
								<div key={field.id} className="flex items-end gap-4">
									<label className="flex-1 space-y-1">
										<span className="text-xs font-medium text-gray-500">{translate('admin.hoursBeforeEvent')}</span>
										<input
											type="number"
											{...register(`cancellationRules.${index}.hoursBeforeEvent`, { valueAsNumber: true })}
											className={fieldClassName}
											disabled={isPending}
											placeholder="e.g. 48"
											min="1"
										/>
										{errors.cancellationRules?.[index]?.hoursBeforeEvent && (
											<p className="text-xs text-red-500">
												{errors.cancellationRules[index]?.hoursBeforeEvent?.message}
											</p>
										)}
									</label>

									<label className="flex-1 space-y-1">
										<span className="text-xs font-medium text-gray-500">{translate('admin.refundPercentage')}</span>
										<input
											type="number"
											{...register(`cancellationRules.${index}.refundPercentage`, { valueAsNumber: true })}
											className={fieldClassName}
											disabled={isPending}
											placeholder="e.g. 100"
											min="0"
											max="100"
										/>
										{errors.cancellationRules?.[index]?.refundPercentage && (
											<p className="text-xs text-red-500">
												{errors.cancellationRules[index]?.refundPercentage?.message}
											</p>
										)}
									</label>

									<Button
										type="button"
										variant="secondary"
										className="h-10 border-red-500 px-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
										disabled={isPending}
										onClick={() => removeCancellation(index)}
									>
										{translate('admin.delete')}
									</Button>
								</div>
							))}
						</div>
					) : (
						<div className="rounded-lg border border-dashed border-gray-300 p-4 text-center dark:border-gray-600">
							<p className="text-xs text-gray-500">
								No custom rules set. By default, users get a 100% refund up until the event starts.
							</p>
						</div>
					)}
				</div>

				{watchedDate && watchedPrice && (
					<CancellationPolicyInfo
						eventDate={watchedDate}
						price={Number(watchedPrice) || 0}
						cancellationRules={watchedRules ?? []}
					/>
				)}

				<hr className="border-gray-200 dark:border-gray-700" />

				<div className="space-y-1.5">
					<span className="text-sm font-semibold">{translate('admin.eventImage')}</span>
					<Controller
						name="images"
						control={control}
						render={({ field }) => (
							<ImageUploader value={field.value ?? []} onChange={field.onChange} disabled={isPending} />
						)}
					/>
					{errors.images && <p className="text-xs text-red-500">{errors.images.message}</p>}
				</div>
			</div>

			<div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
				<Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
					{translate('admin.cancel')}
				</Button>
				<Button type="submit" isLoading={isPending}>
					{submitLabel}
				</Button>
			</div>
		</form>
	);
}
