'use client';

import type { LucideIcon } from 'lucide-react';
import Button from '@/components/ui/Buttons/Button';
import { useSkin } from '@/providers/BrandProvider';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description: string;
	actionLabel: string;
	onAction: () => void;
	/** The classic skin tints the icon disc; `rose` is for the favourites heart. */
	tone?: 'primary' | 'rose';
	headingAs?: 'h1' | 'h2';
}

/**
 * What a page shows when its list is empty. Each skin has its own: a tinted disc and centred
 * text for classic, one thin icon and a left-aligned message for minimal, and a boxed notice
 * with a square icon for listing.
 */
export default function EmptyState({
	icon: Icon,
	title,
	description,
	actionLabel,
	onAction,
	tone = 'primary',
	headingAs: Heading = 'h2',
}: EmptyStateProps) {
	const skin = useSkin();

	if (skin === 'market') {
		return (
			<div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16 text-center">
				<div className="bg-primary/10 text-primary flex size-24 items-center justify-center rounded-3xl">
					<Icon className="size-11" strokeWidth={1.5} />
				</div>
				<Heading className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">{title}</Heading>
				<p className="mt-2 text-gray-500 dark:text-gray-400">{description}</p>
				<Button variant="primary" className="mt-6" onClick={onAction}>
					{actionLabel}
				</Button>
			</div>
		);
	}

	if (skin === 'minimal') {
		return (
			<div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-16">
				<Icon className="size-10 text-gray-400" strokeWidth={1.25} />
				<Heading className="mt-5 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
					{title}
				</Heading>
				<p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
				<div className="mt-6">
					<Button variant="primary" onClick={onAction}>
						{actionLabel}
					</Button>
				</div>
			</div>
		);
	}

	if (skin === 'soft') {
		return (
			<div className="mx-auto flex w-full max-w-xl flex-1 items-center px-4 py-10">
				<div className="flex w-full flex-col items-center rounded-[2rem] border-2 border-dashed border-gray-300 bg-white p-8 text-center sm:p-12 dark:border-gray-600 dark:bg-gray-800">
					<span className="bg-accent/10 text-accent flex size-20 items-center justify-center rounded-full">
						<Icon className="size-9" strokeWidth={1.75} />
					</span>
					<Heading className="mt-5 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
						{title}
					</Heading>
					<p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
					<Button variant="primary" className="mt-6 px-8" onClick={onAction}>
						{actionLabel}
					</Button>
				</div>
			</div>
		);
	}

	if (skin === 'listing') {
		return (
			<div className="mx-auto flex w-full max-w-[1336px] flex-1 items-center px-4 py-10 sm:px-6 lg:px-8">
				<div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-lg border border-gray-200 bg-white p-8 text-center sm:p-12 dark:border-neutral-800 dark:bg-neutral-900">
					<span className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-lg">
						<Icon className="size-8" />
					</span>
					<Heading className="mt-5 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
						{title}
					</Heading>
					<p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
					<Button variant="primary" className="mt-6 px-6 py-2.5" onClick={onAction}>
						{actionLabel}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
			<div
				className={cn(
					'mb-6 flex h-24 w-24 items-center justify-center rounded-full',
					tone === 'rose'
						? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
						: 'bg-primary/10 dark:bg-primary/20 text-primary',
				)}
			>
				<Icon className="h-12 w-12" strokeWidth={tone === 'rose' ? 2 : 1.5} />
			</div>
			<Heading
				className={cn(
					'font-bold text-gray-900 dark:text-white',
					Heading === 'h1' ? 'text-3xl' : 'text-2xl',
				)}
			>
				{title}
			</Heading>
			<p className="mt-3 max-w-md text-gray-500 dark:text-gray-400">{description}</p>
			<Button variant="primary" className="mt-6" onClick={onAction}>
				{actionLabel}
			</Button>
		</div>
	);
}
