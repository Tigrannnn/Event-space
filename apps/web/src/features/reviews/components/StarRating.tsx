'use client';

import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

const SIZES = {
	sm: 'h-3.5 w-3.5',
	md: 'h-5 w-5',
	lg: 'h-9 w-9',
} as const;

interface StarRatingProps {
	value: number;
	size?: keyof typeof SIZES;
	className?: string;
}

/** Stars as a picture: five of them, filled up to the score. */
export function StarRating({ value, size = 'sm', className }: StarRatingProps) {
	return (
		<span className={cn('inline-flex items-center gap-0.5', className)} aria-hidden="true">
			{[1, 2, 3, 4, 5].map((star) => (
				<Star
					key={star}
					className={cn(
						SIZES[size],
						star <= Math.round(value)
							? 'fill-amber-400 text-amber-400'
							: 'fill-transparent text-gray-300 dark:text-gray-600',
					)}
				/>
			))}
		</span>
	);
}

interface StarRatingInputProps {
	value: number;
	onChange: (value: number) => void;
	label: (star: number) => string;
	disabled?: boolean;
}

/**
 * Stars as a control.
 *
 * Five real radio buttons underneath: a keyboard reaches them, a screen reader names them, and
 * the form submits without any of it being wired up by hand.
 */
export function StarRatingInput({ value, onChange, label, disabled }: StarRatingInputProps) {
	return (
		<div className="flex items-center gap-1" role="radiogroup">
			{[1, 2, 3, 4, 5].map((star) => (
				<label key={star} className="cursor-pointer p-1">
					<input
						type="radio"
						name="rating"
						value={star}
						checked={value === star}
						onChange={() => onChange(star)}
						disabled={disabled}
						className="sr-only"
					/>
					<Star
						className={cn(
							'h-9 w-9 transition-transform',
							star <= value
								? 'fill-amber-400 text-amber-400'
								: 'fill-transparent text-gray-300 dark:text-gray-600',
							!disabled && 'hover:scale-110',
						)}
					/>
					<span className="sr-only">{label(star)}</span>
				</label>
			))}
		</div>
	);
}
