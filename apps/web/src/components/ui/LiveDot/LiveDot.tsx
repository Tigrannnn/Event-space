import { cn } from '@/utils/cn';

export interface LiveDotProps {
	className?: string;
	/** Shown on hover/focus — say what updates and how often, since the dot alone does not. */
	label?: string;
}

/**
 * A small pulsing dot marking a widget as self-refreshing, so a number that changes on its own
 * does not read as a bug. Purely decorative — nothing breaks if it is left off a query.
 */
export function LiveDot({ className, label }: LiveDotProps) {
	return (
		<span
			className={cn('relative inline-flex h-2 w-2', className)}
			title={label}
			aria-hidden={!label}
		>
			<span className="bg-accent absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
			<span className="bg-accent relative inline-flex h-2 w-2 rounded-full" />
			{label && <span className="sr-only">{label}</span>}
		</span>
	);
}
