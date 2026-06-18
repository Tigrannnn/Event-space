import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface PageStateProps {
	children?: ReactNode;
	icon?: ReactNode;
	title?: ReactNode;
	description?: ReactNode;
	actions?: ReactNode;
	className?: string;
	contentClassName?: string;
}

export default function PageState({
	children,
	icon,
	title,
	description,
	actions,
	className,
	contentClassName,
}: PageStateProps) {
	return (
		<section
			className={cn(
				'flex min-h-full items-center justify-center px-4 py-8 sm:px-6 lg:px-8',
				className,
			)}
		>
			<div className={cn('w-full max-w-md text-center', contentClassName)}>
				{icon}
				{title && <h1 className="text-primary mb-2 text-2xl font-black">{title}</h1>}
				{description && <p className="text-gray-500 dark:text-gray-400">{description}</p>}
				{children}
				{actions && <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">{actions}</div>}
			</div>
		</section>
	);
}
