'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { optimizeImageUrl } from '@event-space/shared';
import type { BannerFormImage } from './banner-form.schema';
import { cn } from '@/utils/cn';

interface BannerImageFieldProps {
	label: string;
	hint: string;
	removeLabel: string;
	value: BannerFormImage | null;
	onChange: (value: BannerFormImage | null) => void;
	aspectClassName: string;
	disabled?: boolean;
}

const ACCEPTED = 'image/png,image/jpeg,image/webp,image/avif';

export default function BannerImageField({
	label,
	hint,
	removeLabel,
	value,
	onChange,
	aspectClassName,
	disabled,
}: BannerImageFieldProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const previewUrl = value?.kind === 'file' ? value.previewUrl : null;

	// Object URLs are released as they are replaced rather than on unmount: an effect cleanup
	// would also fire on React's development remount and revoke a picture still on screen.
	const replaceWith = (next: BannerFormImage | null) => {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		onChange(next);
	};

	const handleFile = (file: File | undefined) => {
		if (!file) return;

		replaceWith({ kind: 'file', file, previewUrl: URL.createObjectURL(file) });
	};

	const source = value?.kind === 'existing' ? optimizeImageUrl(value.url) : previewUrl;

	return (
		<div className="space-y-1.5">
			<span className="text-sm font-semibold">{label}</span>
			<span className="block text-xs text-gray-500">{hint}</span>

			<div
				className={cn(
					'relative overflow-hidden rounded-xl border border-dashed border-gray-400 bg-gray-50 dark:bg-gray-950',
					aspectClassName,
				)}
			>
				{source ? (
					<Image src={source} alt="" fill sizes="600px" className="object-cover" unoptimized />
				) : (
					<button
						type="button"
						disabled={disabled}
						onClick={() => inputRef.current?.click()}
						className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-gray-500 transition hover:text-gray-700 dark:hover:text-gray-300"
					>
						<ImagePlus className="h-6 w-6" />
						<span className="text-xs">{hint}</span>
					</button>
				)}

				{source && (
					<button
						type="button"
						disabled={disabled}
						onClick={() => replaceWith(null)}
						className="absolute top-2 right-2 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
						aria-label={removeLabel}
					>
						<X className="h-4 w-4" />
					</button>
				)}
			</div>

			<input
				ref={inputRef}
				type="file"
				accept={ACCEPTED}
				className="hidden"
				disabled={disabled}
				onChange={(event) => {
					handleFile(event.target.files?.[0]);
					event.target.value = '';
				}}
			/>
		</div>
	);
}
