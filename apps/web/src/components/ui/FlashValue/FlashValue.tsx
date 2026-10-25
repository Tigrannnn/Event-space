'use client';

import { motion } from 'framer-motion';
import { useFlashOnChange } from '@/hooks/liveQuery';
import { cn } from '@/utils/cn';

export interface FlashValueProps {
	/** Whatever decides when to flash — a formatted string is fine, it just has to change. */
	watch: string | number;
	children: React.ReactNode;
	className?: string;
	/**
	 * 'background' tints the background on change — for plain text with no background of its
	 * own. 'pop' only scales it up and back — for something that already carries its own
	 * background (a coloured badge), where tinting the background would hide it instead.
	 */
	variant?: 'background' | 'pop';
}

const backgroundIdle = {
	backgroundColor: 'color-mix(in srgb, var(--color-accent) 0%, transparent)',
	scale: 1,
};
const backgroundFlash = {
	backgroundColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
	scale: 1.04,
};
const popIdle = { scale: 1 };
const popFlash = { scale: 1.18 };

/**
 * Wraps a number that can change behind the viewer's back (a live poll, someone else's booking)
 * and briefly highlights it when it does, so the change reads as "this updated" rather than
 * going unnoticed or looking like a layout glitch.
 */
export function FlashValue({ watch, children, className, variant = 'background' }: FlashValueProps) {
	const isFlashing = useFlashOnChange(watch);
	const states = variant === 'background' ? { idle: backgroundIdle, flash: backgroundFlash } : { idle: popIdle, flash: popFlash };

	return (
		<motion.span
			className={cn('inline-block rounded-md', variant === 'background' && 'px-0.5', className)}
			animate={isFlashing ? states.flash : states.idle}
			transition={{ duration: isFlashing ? 0.2 : 0.8, ease: 'easeOut' }}
		>
			{children}
		</motion.span>
	);
}
