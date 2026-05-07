'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	type CreateEventData,
	type Event,
	EventFormSchema,
	type EventFormValues,
	EventStatusEnum,
	EventDifficultyEnum,
} from '@event-space/shared';
import { mapEventToFormValues, mapFormValuesToPayload } from './form-mappers';
import Button from '@/components/ui/Buttons/Button';
import Select from '@/components/ui/Select';
import { ModalHeader } from '@/components/ui/Modal';
import { EVENT_STATUS_LABELS, EVENT_DIFFICULTY_LABELS } from '@/constants/mappers';

interface EventFormProps {
	submitLabel: string;
	event?: Event;
	isPending: boolean;
	onCancel: () => void;
	onSubmit: (data: CreateEventData) => void;
}

const difficultyOptions = EventDifficultyEnum.options.map(diff => ({
	value: diff,
	label: EVENT_DIFFICULTY_LABELS[diff]
}));

const statusOptions = EventStatusEnum.options.map(status => ({
	value: status,
	label: EVENT_STATUS_LABELS[status]
}));

const fieldClassName =
	'focus:border-primary h-10 w-full rounded-md border border-gray-500 bg-transparent px-3 text-sm outline-none text-gray-900 dark:text-gray-100 ' +
	'[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

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
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<EventFormValues>({
		resolver: zodResolver(EventFormSchema),
		defaultValues: mapEventToFormValues(event),
	});

	const onFormSubmit = (values: EventFormValues) => {
		onSubmit(mapFormValuesToPayload(values));
	};

	return (
		<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 p-5 sm:p-6">
			<ModalHeader title={event ? 'Update Event' : 'Create Event'} onClose={onCancel} />

			<div className="grid gap-4 lg:grid-cols-2">
				{/* Title */}
				<label className="space-y-1.5">
					<span className="text-sm font-semibold">Title</span>
					<input {...register('title')} className={fieldClassName} />
					{errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
				</label>

				{/* Category */}
				<label className="space-y-1.5">
					<span className="text-sm font-semibold">Category</span>
					<input {...register('category')} className={fieldClassName} />
					{errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
				</label>

				{/* Location */}
				<label className="space-y-1.5">
					<span className="text-sm font-semibold">Location</span>
					<input {...register('location')} className={fieldClassName} />
					{errors.location && <p className="text-xs text-red-500">{errors.location.message}</p>}
				</label>

				{/* Date */}
				<label className="space-y-1.5">
					<span className="text-sm font-semibold">Date</span>
					<input type="datetime-local" {...register('date')} className={fieldClassName} />
					{errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
				</label>

				{/* Difficulty */}
				<label className="space-y-1.5">
					<span className="text-sm font-semibold">Difficulty</span>
					<Select
						value={watch('difficulty')}
						onValueChange={(v) => setValue('difficulty', v as any)}
						options={difficultyOptions}
						className="w-full"
					/>
				</label>

				{/* Status */}
				<label className="space-y-1.5">
					<span className="text-sm font-semibold">Status</span>
					<Select
						value={watch('status')}
						onValueChange={(v) => setValue('status', v as any)}
						options={statusOptions}
						className="w-full"
					/>
				</label>

				{/* Price */}
				<label className="space-y-1.5">
					<span className="text-sm font-semibold">Price</span>
					<input type="number" step="0.01" {...register('price')} className={fieldClassName} />
					{errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
				</label>

				{/* Max Participants */}
				<label className="space-y-1.5">
					<span className="text-sm font-semibold">Max participants</span>
					<input type="number" {...register('maxParticipants')} className={fieldClassName} />
					{errors.maxParticipants && (
						<p className="text-xs text-red-500">{errors.maxParticipants.message}</p>
					)}
				</label>

				{/* Duration */}
				<label className="space-y-1.5">
					<span className="text-sm font-semibold">Duration (min)</span>
					<input type="number" {...register('duration')} className={fieldClassName} />
					{errors.duration && <p className="text-xs text-red-500">{errors.duration.message}</p>}
				</label>

				{/* Description */}
				<label className="space-y-1.5 lg:col-span-2">
					<span className="text-sm font-semibold">Description</span>
					<textarea {...register('description')} className={textareaClassName} />
					{errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
				</label>

				{/* Images */}
				<label className="space-y-1.5">
					<span className="text-sm font-semibold">Image URLs (one per line)</span>
					<textarea {...register('images')} className={textareaClassName} />
					{errors.images && <p className="text-xs text-red-500">{errors.images.message}</p>}
				</label>

				{/* whatsIncluded */}
				<label className="space-y-1.5">
					<span className="text-sm font-semibold">Included items (one per line)</span>
					<textarea {...register('whatsIncluded')} className={textareaClassName} />
					{errors.whatsIncluded && (
						<p className="text-xs text-red-500">{errors.whatsIncluded.message}</p>
					)}
				</label>
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
