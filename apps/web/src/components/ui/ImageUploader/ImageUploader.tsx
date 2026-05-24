'use client';

import { useCallback, useId, useMemo, useState } from 'react';
import { GripVertical, Plus, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { MAX_EVENT_IMAGES, type ImageUploaderItem } from '@event-space/shared';

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

function getItemKey(item: ImageUploaderItem, index: number): string {
	if (item.kind === 'existing') return item.id;
	return `file-${item.previewUrl}-${item.file.name}-${index}`;
}

function reorderItems(items: ImageUploaderItem[]): ImageUploaderItem[] {
	return items.map((item, order) => ({ ...item, order }));
}

function isFileDragEvent(event: React.DragEvent): boolean {
	return Array.from(event.dataTransfer.types).includes('Files');
}

export default function ImageUploader({
	value = [],
	onChange,
	maxImages = MAX_EVENT_IMAGES,
	disabled = false,
}: ImageUploaderProps) {
	const inputId = useId();
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

	const sorted = useMemo(
		() => [...value].sort((a, b) => a.order - b.order),
		[value],
	);

	const canAddMore = sorted.length < maxImages;
	const canReorder = sorted.length > 1 && !disabled;

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
		const next = sorted.filter((_, i) => i !== index);
		onChange(reorderItems(next));
	};

	const moveItem = (fromIndex: number, toIndex: number) => {
		if (fromIndex === toIndex) return;
		const next = [...sorted];
		const [moved] = next.splice(fromIndex, 1);
		next.splice(toIndex, 0, moved);
		onChange(reorderItems(next));
	};

	const handleReorderDragStart = (index: number) => {
		if (!canReorder) return;
		setDraggedIndex(index);
	};

	const handleThumbnailDragOver = (event: React.DragEvent, index: number) => {
		if (isFileDragEvent(event)) {
			event.preventDefault();
			return;
		}
		if (!canReorder || draggedIndex === null) return;
		event.preventDefault();
		setDropTargetIndex(index);
	};

	const handleThumbnailDrop = (event: React.DragEvent, index: number) => {
		event.preventDefault();
		event.stopPropagation();

		if (event.dataTransfer.files?.length) {
			addFiles(Array.from(event.dataTransfer.files));
			return;
		}

		if (draggedIndex === null) return;
		moveItem(draggedIndex, index);
		setDraggedIndex(null);
		setDropTargetIndex(null);
	};

	const handleReorderDragEnd = () => {
		setDraggedIndex(null);
		setDropTargetIndex(null);
	};

	return (
		<div className="space-y-2">
			<p className="text-xs text-gray-500 dark:text-gray-400">
				{canReorder
					? 'Drop images from your computer, or click + to browse. Drag thumbnails to reorder — first is the cover.'
					: 'Drop images from your computer here, or click + to browse.'}
			</p>

			<div
				{...getRootProps()}
				className={[
					'flex flex-wrap gap-4 rounded-xl p-1 transition-colors',
					isDragActive ? 'bg-primary/10 ring-primary ring-2 ring-dashed' : '',
				].join(' ')}
			>
				<input {...getInputProps({ id: inputId })} />

				{sorted.map((item, index) => {
					const isDragging = draggedIndex === index;
					const isDropTarget = dropTargetIndex === index && draggedIndex !== index;

					return (
						<div
							key={getItemKey(item, index)}
							draggable={canReorder}
							onDragStart={() => handleReorderDragStart(index)}
							onDragOver={(e) => handleThumbnailDragOver(e, index)}
							onDrop={(e) => handleThumbnailDrop(e, index)}
							onDragEnd={handleReorderDragEnd}
							className={[
								'group relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border bg-gray-100 shadow-sm dark:bg-gray-800',
								isDragging ? 'opacity-50' : '',
								isDropTarget
									? 'border-primary ring-primary/30 ring-2'
									: 'border-gray-200 dark:border-gray-700',
								canReorder ? 'cursor-grab active:cursor-grabbing' : '',
							].join(' ')}
						>
							<img
								src={getPreviewUrl(item)}
								alt={`Event image ${index + 1}`}
								className="pointer-events-none h-full w-full object-cover"
								draggable={false}
							/>
							{canReorder && (
								<div className="absolute bottom-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white">
									<GripVertical className="h-3.5 w-3.5" />
								</div>
							)}
							{index === 0 && (
								<span className="absolute top-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
									Cover
								</span>
							)}
							<button
								type="button"
								disabled={disabled}
								onClick={() => removeAt(index)}
								className="absolute top-1 right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 disabled:opacity-50"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
					);
				})}

				{canAddMore && !disabled && (
					<button
						type="button"
						onClick={open}
						className={[
							'hover:border-primary flex h-32 w-32 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50',
							isDragActive
								? 'border-primary bg-primary/5'
								: 'border-gray-300 dark:border-gray-600',
						].join(' ')}
					>
						<Plus className="text-primary mb-1 h-8 w-8" />
						<span className="px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
							{isDragActive ? 'Drop here' : 'Add or drop'}
						</span>
					</button>
				)}
			</div>
		</div>
	);
}
