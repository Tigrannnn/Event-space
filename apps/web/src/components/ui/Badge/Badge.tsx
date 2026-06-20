'use client';

import { cn } from '@/utils/cn';

export interface BadgeProps {
	label: string;
	variant?: 'success' | 'warning' | 'danger' | 'info';
	className?: string;
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
	success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
	warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
	danger: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
	info: 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export default function Badge({ label, variant = 'info', className }: BadgeProps) {
	return (
		<span
			className={cn(
				'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
				variantStyles[variant],
				className,
			)}
		>
			{label}
		</span>
	);
}
