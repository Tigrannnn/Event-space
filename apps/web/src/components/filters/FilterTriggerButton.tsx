'use client';

import { isFlatSkin } from '@/utils/skin';
import type React from 'react';
import { cn } from '@/utils/cn';
import { ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/primitives/button';
import { useSkin } from '@/providers/BrandProvider';

interface FilterTriggerButtonProps extends React.ComponentProps<typeof Button> {
	isActive?: boolean;
	showChevron?: boolean;
}

export function FilterTriggerButton({
	className,
	isActive = false,
	showChevron = true,
	children,
	variant = 'outline',
	size = 'sm',
	...props
}: FilterTriggerButtonProps) {
	const skin = useSkin();
	const isMinimal = isFlatSkin(skin);
	const isListing = skin === 'listing';
	const isSoft = skin === 'soft';
	const isMarket = skin === 'market';

	return (
		<Button
			type="button"
			variant={variant}
			size={size}
			className={cn(
				isMarket
					? 'flex h-10 shrink-0 items-center justify-between gap-2 rounded-xl border-0 bg-gray-100 px-4 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-200 hover:text-gray-900 dark:bg-neutral-800 dark:text-gray-100 dark:hover:bg-neutral-700 dark:hover:text-white'
					: isMinimal
					? `${isListing ? 'rounded-md' : 'rounded-full'} flex h-10 shrink-0 items-center justify-between gap-2 border border-gray-300 bg-white px-4 text-sm font-medium text-gray-900 transition-colors hover:border-gray-900 hover:bg-white dark:border-neutral-700 dark:bg-neutral-950 dark:text-gray-100 dark:hover:border-gray-300 dark:hover:bg-neutral-950`
					: isSoft
						? 'flex h-10 shrink-0 items-center justify-between gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 shadow-sm transition-all hover:border-primary/50 hover:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-white'
						: 'border-primary/50 bg-background hover:bg-accent/30 hover:text-accent-foreground flex h-9 shrink-0 items-center justify-between gap-2 rounded-xl border px-4 text-sm font-medium shadow-sm transition-all',
				isActive &&
					(isMarket
						? 'bg-primary/10 text-primary ring-primary hover:bg-primary/10 dark:bg-primary/20 ring-1'
						: isListing
						? 'border-primary bg-primary/10 text-primary ring-primary hover:bg-primary/10 dark:bg-primary/20 ring-1'
						: isMinimal
							? 'border-gray-900 bg-gray-100 ring-1 ring-gray-900 hover:bg-gray-100 dark:border-gray-100 dark:bg-neutral-800 dark:ring-gray-100 dark:hover:bg-neutral-800'
							: 'border-primary/60 bg-primary/10 text-primary ring-primary/60 dark:bg-primary/10 ring-1'),
				className,
			)}
			{...props}
		>
			<div className="flex min-w-0 items-center gap-2">
				{typeof children === 'string' ? <span className="truncate">{children}</span> : children}
			</div>
			{showChevron && <ChevronDownIcon className="ml-2 size-3.5 shrink-0 opacity-60" />}
		</Button>
	);
}

interface CategoryPillProps extends React.ComponentProps<'button'> {
	isActive?: boolean;
}

export function CategoryPill({
	className,
	isActive = false,
	children,
	...props
}: CategoryPillProps) {
	const skin = useSkin();
	const isMinimal = isFlatSkin(skin);
	const isListing = skin === 'listing';
	const isSoft = skin === 'soft';
	const isMarket = skin === 'market';

	return (
		<button
			type="button"
			className={cn(
				isMarket
					? 'h-10 shrink-0 rounded-xl border-0 px-4 text-sm font-medium transition-colors'
					: isMinimal
					? `h-10 shrink-0 ${isListing ? 'rounded-md' : 'rounded-full'} border px-4 text-sm font-medium transition-colors`
					: isSoft
						? 'h-10 shrink-0 rounded-full border px-4 text-sm font-semibold shadow-sm transition-all duration-200'
						: 'h-9 shrink-0 rounded-full border px-4 text-sm font-medium shadow-sm transition-all duration-200',
				isMarket
					? isActive
						? 'bg-primary text-white'
						: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-neutral-800 dark:text-gray-100 dark:hover:bg-neutral-700'
					: isMinimal
					? isActive
						? isListing
							? 'border-primary bg-primary text-white'
							: 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
						: 'border-gray-300 bg-white text-gray-900 hover:border-gray-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-gray-100 dark:hover:border-gray-300'
					: isActive
						? 'border-primary bg-primary font-semibold'
						: 'border-primary/50 bg-background hover:border-primary/40 hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10',
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
}
