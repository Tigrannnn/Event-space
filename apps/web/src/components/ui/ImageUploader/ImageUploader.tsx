'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { AlertTriangle, GripVertical, Plus, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import {
	DndContext,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	closestCenter,
	useSensor,
	useSensors,
	type DragEndEvent,
} from '@dnd-kit/core';
import {
	SortableContext,
	arrayMove,
	rectSortingStrategy,
	sortableKeyboardCoordinates,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MAX_EVENT_IMAGES } from '@event-space/shared';
import type { ImageUploaderItem } from './types';
import { useTranslation } from '@/hooks/translation';

/**
 * Below this width a photo is visibly soft once it fills the event page on a laptop. It is also
 * the telltale of a picture saved out of a messenger, which shrinks whatever passes through it —
 * the usual reason an event ends up with blurry photos.
 */
const MIN_GOOD_IMAGE_WIDTH = 1200;

const ACCEPTED_IMAGE_TYPES = {
	'image/png': ['.png'],
	'image/jpeg': ['.jpg', '.jpeg'],
	'image/webp': ['.webp'],
	'image/avif': ['.avif'],
} as const;

interface ImageUploaderProps {
	value: ImageUploaderItem[];
	onChange: (items: ImageUploaderItem[]) => void;
	maxImages?: number;
	disabled?: boolean;
}

function getPreviewUrl(item: ImageUploaderItem): string {
	return item.kind === 'existing' ? item.url : item.previewUrl;
}

// Must stay the same while the item moves, so no index in it; blob URLs are unique per file.
function getItemKey(item: ImageUploaderItem): string {
	if (item.kind === 'existing') return item.id;
	return `file-${item.previewUrl}`;
}

function reorderItems(items: ImageUploaderItem[]): ImageUploaderItem[] {
	return items.map((item, order) => ({ ...item, order }));
}

function revokeFilePreview(item: ImageUploaderItem): void {
	if (item.kind === 'file' && item.previewUrl.startsWith('blob:')) {
		URL.revokeObjectURL(item.previewUrl);
	}
}

// Stops a press on a control inside the thumbnail from starting a drag of the thumbnail.
const stopDragStart = {
	onMouseDown: (event: React.SyntheticEvent) => event.stopPropagation(),
	onTouchStart: (event: React.SyntheticEvent) => event.stopPropagation(),
	onKeyDown: (event: React.SyntheticEvent) => event.stopPropagation(),
};

interface SortableThumbnailProps {
	item: ImageUploaderItem;
	index: number;
	canReorder: boolean;
	disabled: boolean;
	onRemove: () => void;
	lowResWidth?: number;
	onMeasured: (width: number) => void;
}

function SortableThumbnail({
	item,
	index,
	canReorder,
	disabled,
	onRemove,
	lowResWidth,
	onMeasured,
}: SortableThumbnailProps) {
	const translate = useTranslation();
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: getItemKey(item),
		disabled: !canReorder,
	});

	return (
		<div
			ref={setNodeRef}
			style={{ transform: CSS.Translate.toString(transform), transition }}
			{...attributes}
			{...listeners}
			className={[
				// select-none + no touch callout: the long press that starts a drag on a phone
				// would otherwise select text or open the image menu.
				'group relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm select-none [-webkit-touch-callout:none] dark:border-gray-700 dark:bg-gray-800',
				isDragging ? 'ring-primary z-10 opacity-80 shadow-lg ring-2' : '',
				canReorder ? 'cursor-grab active:cursor-grabbing' : '',
			].join(' ')}
		>
			<img
				src={getPreviewUrl(item)}
				alt={`Event image ${index + 1}`}
				className="pointer-events-none h-full w-full object-cover"
				draggable={false}
				onLoad={(event) => onMeasured(event.currentTarget.naturalWidth)}
			/>
			{lowResWidth !== undefined && (
				<div
					className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-amber-500/90 px-1.5 py-1 text-[10px] font-medium text-white"
					title={translate('admin.imageLowRes', { width: String(lowResWidth) })}
				>
					<AlertTriangle className="h-3 w-3 shrink-0" />
					<span className="truncate">{lowResWidth} px</span>
				</div>
			)}
			{canReorder && (
				<div className="absolute bottom-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white">
					<GripVertical className="h-3.5 w-3.5" />
				</div>
			)}
			{index === 0 && (
				<span className="absolute top-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
					{translate('admin.cover')}
				</span>
			)}
			<button
				type="button"
				disabled={disabled}
				onClick={onRemove}
				{...stopDragStart}
				className="absolute top-1 right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 disabled:opacity-50"
			>
				<X className="h-4 w-4" />
			</button>
		</div>
	);
}

export default function ImageUploader({
	value = [],
	onChange,
	maxImages = MAX_EVENT_IMAGES,
	disabled = false,
}: ImageUploaderProps) {
	const translate = useTranslation();
	const inputId = useId();
	// Natural width per image, filled in as each thumbnail loads.
	const [widths, setWidths] = useState<Record<string, number>>({});
	const fileItemsRef = useRef<ImageUploaderItem[]>([]);

	const sorted = useMemo(() => [...value].sort((a, b) => a.order - b.order), [value]);

	const canAddMore = sorted.length < maxImages;
	const canReorder = sorted.length > 1 && !disabled;

	fileItemsRef.current = sorted.filter((item) => item.kind === 'file');

	useEffect(() => {
		return () => {
			for (const item of fileItemsRef.current) {
				revokeFilePreview(item);
			}
		};
	}, []);

	const addFiles = useCallback(
		(files: File[]) => {
			if (!files.length || disabled || !canAddMore) return;

			const slotsLeft = maxImages - sorted.length;
			const picked = files.slice(0, slotsLeft);
			if (!picked.length) return;

			const newItems: ImageUploaderItem[] = picked.map((file, offset) => ({
				kind: 'file' as const,
				file,
				previewUrl: URL.createObjectURL(file),
				order: sorted.length + offset,
			}));

			onChange(reorderItems([...sorted, ...newItems]));
		},
		[disabled, canAddMore, maxImages, sorted, onChange],
	);

	const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
		onDrop: addFiles,
		accept: ACCEPTED_IMAGE_TYPES,
		disabled: disabled || !canAddMore,
		multiple: true,
		noClick: true,
		noKeyboard: true,
	});

	const removeAt = (index: number) => {
		const removed = sorted[index];
		if (removed) {
			revokeFilePreview(removed);
		}
		const next = sorted.filter((_, i) => i !== index);
		onChange(reorderItems(next));
	};

	const sensors = useSensors(
		// A few pixels of travel so a click on the thumbnail is still just a click.
		useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
		// On touch a short hold starts the drag; moving before that scrolls the page.
		useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	const rememberWidth = useCallback((key: string, width: number) => {
		setWidths((current) => (current[key] === width ? current : { ...current, [key]: width }));
	}, []);

	const lowResCount = sorted.filter((item) => {
		const width = widths[getItemKey(item)];
		return width !== undefined && width < MIN_GOOD_IMAGE_WIDTH;
	}).length;

	const handleDragEnd = ({ active, over }: DragEndEvent) => {
		if (!over || active.id === over.id) return;
		const fromIndex = sorted.findIndex((item) => getItemKey(item) === active.id);
		const toIndex = sorted.findIndex((item) => getItemKey(item) === over.id);
		if (fromIndex === -1 || toIndex === -1) return;
		onChange(reorderItems(arrayMove(sorted, fromIndex, toIndex)));
	};

	return (
		<div className="space-y-2">
			<p className="text-xs text-gray-500 dark:text-gray-400">
				{canReorder
					? translate('admin.dropImagesHintReorder')
					: translate('admin.dropImagesHint')}
			</p>

			<div
				{...getRootProps()}
				className={[
					'flex flex-wrap gap-4 rounded-xl p-1 transition-colors',
					isDragActive ? 'bg-primary/10 ring-primary ring-dashed ring-2' : '',
				].join(' ')}
			>
				<input {...getInputProps({ id: inputId })} />

				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<SortableContext items={sorted.map(getItemKey)} strategy={rectSortingStrategy}>
						{sorted.map((item, index) => {
							const width = widths[getItemKey(item)];

							return (
								<SortableThumbnail
									key={getItemKey(item)}
									item={item}
									index={index}
									canReorder={canReorder}
									disabled={disabled}
									onRemove={() => removeAt(index)}
									lowResWidth={
										width !== undefined && width < MIN_GOOD_IMAGE_WIDTH ? width : undefined
									}
									onMeasured={(measured) => rememberWidth(getItemKey(item), measured)}
								/>
							);
						})}
					</SortableContext>
				</DndContext>

				{canAddMore && !disabled && (
					<button
						type="button"
						onClick={open}
						className={[
							'hover:border-primary flex h-32 w-32 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50',
							isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-600',
						].join(' ')}
					>
						<Plus className="text-primary mb-1 h-8 w-8" />
						<span className="px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
							{isDragActive ? translate('admin.dropHere') : translate('admin.addOrDrop')}
						</span>
					</button>
				)}
			</div>

			{lowResCount > 0 && (
				<p className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-500">
					<AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
					<span>{translate('admin.imageLowResHint', { count: String(lowResCount) })}</span>
				</p>
			)}
		</div>
	);
}
