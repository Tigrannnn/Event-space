import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Plus, Loader2 } from 'lucide-react';
import { uploadApi } from '@/features/upload/api/upload.api';

interface ImageUploaderProps {
	value: string[];
	onChange: (urls: string[]) => void;
	maxImages?: number;
}

export default function ImageUploader({ value = [], onChange, maxImages = 5 }: ImageUploaderProps) {
	const [isUploading, setIsUploading] = useState(false);

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			if (value.length >= maxImages) return;

			setIsUploading(true);
			try {
				// Upload all selected files concurrently
				const uploadPromises = acceptedFiles.map((file) => uploadApi.uploadImage(file));
				const results = await Promise.all(uploadPromises);

				const newUrls = results.map((res) => res.url);
				onChange([...value, ...newUrls].slice(0, maxImages));
			} catch (error) {
				console.error('Failed to upload image:', error);
				// TODO: add toast notification here
			} finally {
				setIsUploading(false);
			}
		},
		[value, onChange, maxImages]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.avif'],
		},
		disabled: isUploading || value.length >= maxImages,
	});

	const removeImage = (indexToRemove: number) => {
		onChange(value.filter((_, index) => index !== indexToRemove));
	};

	return (
		<div className="flex flex-wrap gap-4">
			{/* Existing Images */}
			{value.map((url, index) => (
				<div
					key={`${url}-${index}`}
					className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm dark:border-gray-700 dark:bg-gray-800"
				>
					<img src={url} alt={`Uploaded ${index + 1}`} className="h-full w-full object-cover" />
					<button
						type="button"
						onClick={() => removeImage(index)}
						className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
			))}

			{/* Dropzone (+) */}
			{value.length < maxImages && (
				<div
					{...getRootProps()}
					className={`flex h-32 w-32 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
						isDragActive
							? 'border-primary bg-primary/5'
							: 'border-gray-300 hover:border-primary hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800/50'
					} ${isUploading ? 'pointer-events-none opacity-70' : ''}`}
				>
					<input {...getInputProps()} />
					{isUploading ? (
						<Loader2 className="text-primary h-8 w-8 animate-spin" />
					) : (
						<>
							<Plus className="text-primary mb-1 h-8 w-8" />
							<span className="text-xs font-medium text-gray-500 dark:text-gray-400">Add Image</span>
						</>
					)}
				</div>
			)}
		</div>
	);
}
