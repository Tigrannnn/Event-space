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

interface EventFormProps {
	submitLabel: string;
	event?: Event;
	isPending: boolean;
	onCancel: () => void;
	onSubmit: (values: EventFormValues) => void;
}

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

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'cancellationRules',
	});

	const handleFormSubmit = (values: EventFormValues) => {
		onSubmit(values);
	};

	return (
		<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 p-5 sm:p-6">
			<ModalHeader title={event ? 'Update Event' : 'Create Event'} onClose={onCancel} />

			<div className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<label className="space-y-1.5">
						<span className="text-sm font-semibold">Title</span>
						<input {...register('title')} className={fieldClassName} disabled={isPending} />
						{errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
					</label>
					<label className="space-y-1.5">
						<span className="text-sm font-semibold">Category</span>
						<input {...register('category')} className={fieldClassName} disabled={isPending} />
						{errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
					</label>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<label className="space-y-1.5">
						<span className="text-sm font-semibold">Location</span>
						<input {...register('location')} className={fieldClassName} disabled={isPending} />
						{errors.location && <p className="text-xs text-red-500">{errors.location.message}</p>}
					</label>
					<label className="space-y-1.5">
						<span className="text-sm font-semibold">Google Maps URL</span>
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
					<span className="text-sm font-semibold">Date & time</span>
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
					<span className="text-sm font-semibold">Difficulty <span className="text-gray-400">(optional)</span></span>
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
						<span className="text-sm font-semibold">Status</span>
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
						<span className="text-sm font-semibold">Price</span>
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
						<span className="text-sm font-semibold">Duration (min)</span>
						<input
							type="number"
							{...register('duration')}
							className={fieldClassName}
							disabled={isPending}
						/>
						{errors.duration && <p className="text-xs text-red-500">{errors.duration.message}</p>}
					</label>
					<label className="space-y-1.5">
						<span className="text-sm font-semibold">Max participants</span>
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
								Cancellation Rules
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
							onClick={() => append({ hoursBeforeEvent: 24, refundPercentage: 50 })}
						>
							+ Add Rule
						</Button>
					</div>

					{fields.length > 0 ? (
						<div className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
							{fields.map((field, index) => (
								<div key={field.id} className="flex items-end gap-4">
									<label className="flex-1 space-y-1">
										<span className="text-xs font-medium text-gray-500">Hours before event</span>
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
										<span className="text-xs font-medium text-gray-500">Refund Percentage (%)</span>
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
										onClick={() => remove(index)}
									>
										Delete
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

				<label className="block space-y-1.5">
					<span className="text-sm font-semibold">Description</span>
					<textarea {...register('description')} className={textareaClassName} disabled={isPending} />
					{errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
				</label>

				<label className="block space-y-1.5">
					<span className="text-sm font-semibold">Included items (one per line)</span>
					<textarea {...register('whatsIncluded')} className={textareaClassName} disabled={isPending} />
					{errors.whatsIncluded && (
						<p className="text-xs text-red-500">{errors.whatsIncluded.message}</p>
					)}
				</label>

				<div className="space-y-1.5">
					<span className="text-sm font-semibold">Event images</span>
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
					Cancel
				</Button>
				<Button type="submit" isLoading={isPending}>
					{submitLabel}
				</Button>
			</div>
		</form>
	);
}
